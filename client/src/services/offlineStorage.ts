import { openDB, IDBPDatabase } from 'idb';
import { api } from './api';
import CryptoJS from 'crypto-js';

const DB_NAME = 'dentalClinicOffline';
const DB_VERSION = 1;
// Use Vite's environment variables
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'secure-encryption-key-for-development';

interface SyncQueueItem {
  id?: number;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  endpoint: string;
  data: any;
  timestamp: number;
}

class OfflineStorage {
  private db: IDBPDatabase | null = null;

  async initialize() {
    this.db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Store for patients
        if (!db.objectStoreNames.contains('patients')) {
          db.createObjectStore('patients', { keyPath: '_id' });
        }
        
        // Store for sync queue
        if (!db.objectStoreNames.contains('syncQueue')) {
          db.createObjectStore('syncQueue', { 
            keyPath: 'id',
            autoIncrement: true 
          });
        }
      }
    });
  }

  // Encrypt data before storing
  private encrypt(data: any): string {
    return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
  }

  // Decrypt data after retrieval
  private decrypt(encryptedData: string): any {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  }

  // Store patient data locally
  async storePatient(patient: any) {
    if (!this.db) await this.initialize();
    const encryptedData = this.encrypt(patient);
    await this.db!.put('patients', { _id: patient._id, data: encryptedData });
  }

  // Retrieve patient data
  async getPatient(id: string) {
    if (!this.db) await this.initialize();
    const record = await this.db!.get('patients', id);
    return record ? this.decrypt(record.data) : null;
  }

  // Get all patients
  async getAllPatients() {
    if (!this.db) await this.initialize();
    const records = await this.db!.getAll('patients');
    return records.map(record => this.decrypt(record.data));
  }

  // Add operation to sync queue
  async addToSyncQueue(operation: SyncQueueItem) {
    if (!this.db) await this.initialize();
    await this.db!.add('syncQueue', {
      ...operation,
      timestamp: Date.now()
    });
  }

  // Process sync queue when online
  async processSyncQueue() {
    if (!this.db) await this.initialize();
    const tx = this.db!.transaction('syncQueue', 'readwrite');
    const store = tx.objectStore('syncQueue');
    const items = await store.getAll();

    for (const item of items) {
      try {
        switch (item.operation) {
          case 'CREATE':
            await api.post(item.endpoint, item.data);
            break;
          case 'UPDATE':
            await api.put(item.endpoint, item.data);
            break;
          case 'DELETE':
            await api.delete(item.endpoint);
            break;
        }
        await store.delete(item.id!);
      } catch (error) {
        console.error('Sync failed for item:', item, error);
      }
    }

    await tx.done;
  }

  // Check if there are pending sync operations
  async hasPendingSyncOperations(): Promise<boolean> {
    if (!this.db) await this.initialize();
    const count = await this.db!.count('syncQueue');
    return count > 0;
  }

  // Full data sync with server
  async fullSync() {
    try {
      // First, process any pending sync operations
      await this.processSyncQueue();

      // Then fetch all patients from server
      const response = await api.get('/patients');
      const serverPatients = response.data.patients;

      // Update local storage
      const tx = this.db!.transaction('patients', 'readwrite');
      const store = tx.objectStore('patients');

      // Clear existing data
      await store.clear();

      // Store new data
      for (const patient of serverPatients) {
        await this.storePatient(patient);
      }

      await tx.done;
    } catch (error) {
      console.error('Full sync failed:', error);
      throw error;
    }
  }
}

export const offlineStorage = new OfflineStorage(); 