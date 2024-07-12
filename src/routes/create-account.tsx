import { FirebaseError } from "firebase/app";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Wrapper,
  Title,
  Form,
  Input,
  Error,
  Switcher,
} from "../components/auth-component";
import ExternalLogin from "../components/external-login";
import { auth } from "../firebase";

export default function CreateAccount() {
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [state, setState] = useState({
    name: "",
    email: "",
    password: "",
    error: "",
  });

  const { name, email, password, error } = state;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setState((preVal) => ({
      ...preVal,
      [name]: value,
    }));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState((preVal) => ({
      ...preVal,
      error: "",
    }));
    console.log(email, name, password);
    if (isLoading || email === "" || name === "" || password === "") {
      return;
    }
    try {
      setLoading(true);
      // 계정 생성
      const credentials = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      //   console.log(credentials.user);

      // 유저 정보 업데이트 하기
      await updateProfile(credentials.user, {
        displayName: name,
      });
      // 홈페이지로 리다이렉트
      navigate("/");
    } catch (e: any) {
      if (e instanceof FirebaseError) {
        setState((preVal) => ({
          ...preVal,
          error: e.message,
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <Title>Join the Community</Title>
      <Form onSubmit={onSubmit}>
        <Input
          name="name"
          value={name}
          onChange={handleChange}
          placeholder="Name"
          type="text"
          required
        />
        <Input
          name="email"
          value={email}
          onChange={handleChange}
          placeholder="Email"
          type="email"
          required
        />
        <Input
          name="password"
          value={password}
          onChange={handleChange}
          placeholder="Password"
          type="password"
          required
        />
        <Input
          type="submit"
          value={isLoading ? "Loading..." : "Create Account"}
        />
      </Form>
      {error !== "" ? <Error>{error}</Error> : null}
      <Switcher>
        Already have an account? <Link to="/login">Log in &rarr;</Link>
      </Switcher>
      <ExternalLogin />
    </Wrapper>
  );
}
