import { FirebaseError } from "firebase/app";
import { sendPasswordResetEmail } from "firebase/auth";
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

export default function PwInquiry() {
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      alert(
        "비밀번호 관련정보를 입력하신 이메일로 전달하였습니다.\n메일을 확인해주세요."
      );
      navigate("/login");
    } catch (error: any) {
      if (error instanceof FirebaseError) {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <Title>비밀번호 찾기</Title>
      <Form onSubmit={handleResetPassword}>
        <Input
          name="email"
          value={email}
          onChange={handleChange}
          placeholder="Email"
          type="email"
          required
        />
        <Input type="submit" value={isLoading ? "Loading..." : "확인"} />
      </Form>
      {error !== "" ? <Error>{error}</Error> : null}
      <Switcher>
        로그인창으로 <Link to="/Login">로그인 &rarr;</Link>
      </Switcher>
    </Wrapper>
  );
}
