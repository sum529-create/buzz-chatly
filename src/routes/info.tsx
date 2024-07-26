import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { MainWrapper, Switcher, Title } from "../components/auth-component";
import {
  BuzzTime,
  Payload,
  ProfileImageWrapper,
  ProfileTxtWrapper,
  ProfileWrapper,
  Username,
} from "../components/common-component";

// 부모 컨테이너 스타일 정의
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  flex-direction: column;
  width: 100%;
  position: relative;
  overflow: hidden;
  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

// 텍스트 컬럼 스타일 정의
const TextColumn = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  text-align: center;
  height: 66.67vh; /* 2/3 of viewport height */
  width: 100%;

  @media (min-width: 768px) {
    width: 50%;
  }
`;

// 폰 프레임 스타일 정의
const PhoneFrame = styled.div`
  width: 300px;
  height: 600px;
  border-radius: 36px;
  background: #000;
  position: relative;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: -5px;
    left: -5px;
    right: -5px;
    bottom: -5px;
    border-radius: 41px;
    background: linear-gradient(to top, #b3ffab, #12fff7);
  }
  &::after {
    content: "";
    position: absolute;
    top: 5px;
    left: 5px;
    right: 5px;
    bottom: 5px;
    border-radius: 41px;
    background: radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%);
    overflow: hidden;
    filter: drop-shadow(0 0 10px white);
  }
`;

// 폰 스크린 스타일 정의
const PhoneScreen = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  position: relative;
  z-index: 1;
`;

// 텍스트 애니메이션 정의
const scroll = keyframes`
  0%, 20% { opacity: 0; transform: translateY(100%); }
  30%, 50% { opacity: 1; transform: translateY(0); }
  60%, 100% { opacity: 0; transform: translateY(-100%); }
`;

const ScrollingText = styled.div<{ delay: number }>`
  position: relative;
  animation: ${scroll} 5s linear infinite;
  animation-delay: ${({ delay }) => delay}s;
  width: 100%;
  height: 10vh;
  display: flex;
  flex-wrap: nowrap;
  padding: 10px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 15px;
  margin-bottom: 1rem;
  flex-direction: column;
  text-align: left;
  align-items: flex-start;
`;

// 버튼 스타일 정의
const PhoneButton = styled.div`
  width: 100%;
  position: relative;
  bottom: 0;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: space-around;
  padding-top: 10px;
  svg {
    width: 25px;
  }
`;

const PhoneMainScreen = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  /* justify-content: center; */
  flex-wrap: nowrap;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;
`;

const ProfileMiniImageWrapper = styled(ProfileImageWrapper)<{ color: string }>`
  width: 30px;
  height: 30px;
  svg {
    width: 20px;
  }
  background-color: ${(props) => props?.color};
`;

const InfoProfileTxtWrapper = styled(ProfileTxtWrapper)`
  gap: 3px;
`;

const InfoUsername = styled(Username)`
  font-size: 14px;
`;

const InfoBuzzTime = styled(BuzzTime)`
  font-size: 10px;
`;

const InfoPayload = styled(Payload)`
  font-size: 1rem;
`;

// 텍스트 스타일 정의
const LargeText = styled(Title)`
  font-size: 36px;
  font-weight: bold;
  text-align: right;
  line-height: 1.5;
`;

const SmallText = styled.div`
  font-size: 1rem;
  margin-top: 40px;
  line-height: 2;
`;

// 메시지 배열
const messages = [
  {
    name: "Sumin",
    date: "2024-07.24",
    txt: "버즈로 무료함을 달래보세요.",
    color: "#05c46b",
  },
  {
    name: "Alice",
    date: "2024-07.24",
    txt: "새로운 사람들과 소통해보세요.",
    color: "#b71540",
  },
  {
    name: "Bob",
    date: "2024-07.24",
    txt: "당신의 일상을 공유하세요.",
    color: "#0c2461",
  },
  {
    name: "David",
    date: "2024-07.24",
    txt: "버즈 커뮤니티에 가입해보세요.",
    color: "#e58e26",
  },
  {
    name: "Eve",
    date: "2024-07.24",
    txt: "버즈는 누구나 함께할 수 있습니다.",
    color: "#079992",
  },
];

export default function Info() {
  return (
    <MainWrapper>
      <Container>
        <TextColumn>
          <PhoneFrame>
            <PhoneScreen>
              <PhoneMainScreen>
                {messages.map((message, index) => (
                  <ScrollingText key={index} delay={index * 0.5}>
                    <ProfileWrapper>
                      <ProfileMiniImageWrapper color={message.color}>
                        <svg
                          data-slot="icon"
                          fill="none"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                          ></path>
                        </svg>
                      </ProfileMiniImageWrapper>
                      <InfoProfileTxtWrapper>
                        <InfoUsername>{message.name}</InfoUsername>
                        <InfoBuzzTime>{message.date}</InfoBuzzTime>
                      </InfoProfileTxtWrapper>
                    </ProfileWrapper>
                    <InfoPayload>{message.txt}</InfoPayload>
                  </ScrollingText>
                ))}
              </PhoneMainScreen>
              <PhoneButton>
                <svg
                  data-slot="icon"
                  fill="none"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  ></path>
                </svg>
                <svg
                  data-slot="icon"
                  fill="none"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5.25 7.5A2.25 2.25 0 0 1 7.5 5.25h9a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-9Z"
                  ></path>
                </svg>
                <svg
                  data-slot="icon"
                  fill="none"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 19.5 8.25 12l7.5-7.5"
                  ></path>
                </svg>
              </PhoneButton>
            </PhoneScreen>
          </PhoneFrame>
        </TextColumn>
        <TextColumn>
          <LargeText>
            다양한 사람들과
            <br />
            buzz를 작성하여
            <br />
            소통해보세요.
          </LargeText>
          <SmallText>
            <Switcher>
              이미 계정이 있으신가요? <Link to="/login">로그인 &rarr;</Link>
            </Switcher>
            <br />
            <Switcher>
              계정이 없으시다면, 저회와 함께해요!{" "}
              <Link to="/create-account">가입하기 &rarr;</Link>
            </Switcher>
          </SmallText>
        </TextColumn>
      </Container>
    </MainWrapper>
  );
}
