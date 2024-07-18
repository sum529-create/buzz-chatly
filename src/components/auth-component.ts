import styled from "styled-components";

export const MainWrapper = styled.div`
  position: relative;
  padding: 50px 3rem;
  display: flex;
  gap: 1rem;
  flex-direction: column;
  height: 100vh;
  flex-wrap: nowrap;
  align-items: center;
`;

export const Wrapper = styled.div`
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

export const Title = styled.h1`
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

export const Form = styled.form`
  margin-top: 50px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;

  @media (max-width: 768px) {
    margin-top: 30px;
  }
`;

export const Input = styled.input`
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
    margin-bottom: 1rem;

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

export const Error = styled.span`
  font-weight: 600;
  color: tomato;
`;

export const Switcher = styled.span`
  margin-top: 20px;
  a {
    color: #00b894;
    margin-left: 0.5rem;
  }
`;

export const SubLoadingIco = styled.img`
  width: 24px;
`;
