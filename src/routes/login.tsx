import { FirebaseError } from "firebase/app";
import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import {
  Wrapper,
  Title,
  Form,
  Input,
  Error,
  Switcher,
} from "../components/auth-component";
import GithubBtn from "../components/github-btn";

export default function Login() {
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [state, setState] = useState({
    email: "",
    password: "",
    error: "",
  });

  const { email, password, error } = state;

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
    if (isLoading || email === "" || password === "") {
      return;
    }
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      //   console.log(credentials.user);

      // 유저 정보 업데이트 하기

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
      <Title>Login</Title>
      <Form onSubmit={onSubmit}>
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
        <Input type="submit" value={isLoading ? "Loading..." : "Log in"} />
      </Form>
      {error !== "" ? <Error>{error}</Error> : null}
      <Switcher>
        Don't have an account?{" "}
        <Link to="/create-account">Create one &rarr;</Link>
      </Switcher>
      <GithubBtn />
    </Wrapper>
  );
}
