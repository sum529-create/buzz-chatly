import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { styled } from "styled-components";
import { auth } from "../firebase";

const Wrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 90%;
  max-width: 420px;
  padding: 50px 0px;
  margin: auto;

  @media (max-width: 768px) {
    padding: 20px 0px;
  }
`;

const Title = styled.h1`
  font-size: 42px;
  position: relative;
  background: linear-gradient(to top, #b3ffab 0%, #12fff7 100%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  font-family: "Anton SC", sans-serif;
  font-weight: 400;
  font-style: normal;

  @media (max-width: 768px) {
    font-size: 32px;
  }

  &::before {
    content: "";
    background-image: url("/images/logo.png");
    width: 100px;
    height: 100px;
    background-size: cover;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -110px);

    @media (max-width: 768px) {
      width: 80px;
      height: 80px;
      transform: translate(-50%, -90px);
    }
  }
`;

const Form = styled.form`
  margin-top: 50px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;

  @media (max-width: 768px) {
    margin-top: 30px;
  }
`;

const Input = styled.input`
  padding: 10px 20px;
  border-radius: 50px;
  border: none;
  width: 100%;
  font-size: 1rem;
  box-shadow: 3px 2px 5px #000;

  &[type="submit"] {
    background-image: linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%);
    background-size: 200% 100%;
    background-position: right bottom;
    transition: all 0.5s ease;
    cursor: pointer;
    margin-top: 1rem;

    &:hover {
      background-position: left bottom;
      color: #fff;
      opacity: 0.8;
      text-shadow: 1px 1px 0 #00b894, -1px -1px 0 #00b894, 1px -1px 0 #00b894,
        -1px 1px 0 #00b894, 0px 1px 0 #00b894, 0px -1px 0 #00b894,
        1px 0px 0 #00b894, -1px 0px 0 #00b894;
    }
  }
`;

const Error = styled.span`
  font-weight: 600;
  color: tomato;
`;

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
    setLoading(true);
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
    } catch (e) {
      console.error("error occur:", e);
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
    </Wrapper>
  );
}
