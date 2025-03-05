import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import R from 'ramda';

import { faEnvelope } from '@fortawesome/free-solid-svg-icons/faEnvelope';
import { faLock } from '@fortawesome/free-solid-svg-icons/faLock';

import Box from 'react-bulma-companion/lib/Box';
import Block from 'react-bulma-companion/lib/Block';
import Title from 'react-bulma-companion/lib/Title';
import Control from 'react-bulma-companion/lib/Control';
import Button from 'react-bulma-companion/lib/Button';
import Checkbox from 'react-bulma-companion/lib/Checkbox';

import useKeyPress from '_hooks/useKeyPress';
import { attemptLogin } from '_thunks/auth';
import FormInput from '_molecules/FormInput';

export default function Login() {
  const dispatch = useDispatch();

  const [remember, setRemember] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('email');
    if (rememberedEmail) {
      setRemember(true);
      setEmail(rememberedEmail);
    }

    // Log the available test accounts for easy login
    console.log('========== TEST ACCOUNTS ==========');
    console.log('Admin User:');
    console.log('Email: admin@healthcareapps.org');
    console.log('Password: JPtp7XDGF=9ezR>q');
    console.log('----------------------------------');
    console.log('Doctor:');
    console.log('Email: doctor@healthcareapps.org');
    console.log('Password: M9V|?v}}&yrwcJML');
    console.log('----------------------------------');
    console.log('Receptionist:');
    console.log('Email: reception@healthcareapps.org');
    console.log('Password: |;;g]J39=wiqQXKg');
    console.log('----------------------------------');
    console.log('Patient:');
    console.log('Email: patient@healthcareapps.org');
    console.log('Password: ,H,^v&F8MeMK@}64');
    console.log('==================================');
  }, []);

  const login = () => {
    const userCredentials = { email, password };

    if (remember) {
      localStorage.setItem('email', email);
    }

    dispatch(attemptLogin(userCredentials))
      .catch(R.identity);
  };

  useKeyPress('Enter', login);

  const rememberMe = () => {
    localStorage.removeItem('email');
    setRemember(!remember);
  };

  const updateEmail = e => setEmail(e.target.value);
  const updatePassword = e => setPassword(e.target.value);

  return (
    <Box className="login">
      <Title size="3">
        Login
      </Title>
      <hr className="separator" />
      <Block>
        Not Registered Yet?&nbsp;
        <Link to="/register">
          Create an account.
        </Link>
      </Block>
      <FormInput
        onChange={updateEmail}
        placeholder="Email"
        value={email}
        leftIcon={faEnvelope}
        type="email"
      />
      <FormInput
        onChange={updatePassword}
        placeholder="Password"
        value={password}
        leftIcon={faLock}
        type="password"
      />
      <Block>
        <Link to="/recovery">
          Forgot your password?
        </Link>
      </Block>
      <hr className="separator" />
      <Control className="is-clearfix">
        <Button className="is-pulled-right" color="success" onClick={login}>
          Login
        </Button>
        <Checkbox>
          <input type="checkbox" onChange={rememberMe} checked={remember} />
          <span>&nbsp; Remember me</span>
        </Checkbox>
      </Control>
      <Block className="help-text">
        <small>* Check browser console for test account credentials</small>
      </Block>
    </Box>
  );
}
