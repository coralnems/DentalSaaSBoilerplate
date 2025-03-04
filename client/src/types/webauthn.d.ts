declare interface Window {
  PublicKeyCredential: {
    isUserVerifyingPlatformAuthenticatorAvailable: () => Promise<boolean>;
  };
}

declare interface PublicKeyCredentialCreationOptions {
  challenge: BufferSource;
  rp: {
    id: string;
    name: string;
  };
  user: {
    id: BufferSource;
    name: string;
    displayName: string;
  };
  pubKeyCredParams: {
    type: 'public-key';
    alg: number;
  }[];
  timeout?: number;
  attestation?: AttestationConveyancePreference;
  authenticatorSelection?: {
    authenticatorAttachment?: AuthenticatorAttachment;
    requireResidentKey?: boolean;
    residentKey?: ResidentKeyRequirement;
    userVerification?: UserVerificationRequirement;
  };
  excludeCredentials?: PublicKeyCredentialDescriptor[];
  extensions?: AuthenticationExtensionsClientInputs;
}

declare interface PublicKeyCredentialRequestOptions {
  challenge: BufferSource;
  rpId?: string;
  allowCredentials?: PublicKeyCredentialDescriptor[];
  timeout?: number;
  userVerification?: UserVerificationRequirement;
  extensions?: AuthenticationExtensionsClientInputs;
}

declare type AttestationConveyancePreference = 'none' | 'indirect' | 'direct' | 'enterprise';
declare type AuthenticatorAttachment = 'platform' | 'cross-platform';
declare type UserVerificationRequirement = 'required' | 'preferred' | 'discouraged';
declare type ResidentKeyRequirement = 'required' | 'preferred' | 'discouraged';

declare interface PublicKeyCredentialDescriptor {
  type: 'public-key';
  id: BufferSource;
  transports?: AuthenticatorTransport[];
}

declare type AuthenticatorTransport = 'usb' | 'nfc' | 'ble' | 'internal'; 