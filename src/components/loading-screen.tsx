import styled from "styled-components";

const Wrapper = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;
const Text = styled.span`
  margin-top: 10px;
  text-shadow: 1px 1px 1px black;
  padding-left: 10px;
`;
const LoadingIcon = styled.img``;

export default function LoadingScreen() {
  return (
    <Wrapper>
      <LoadingIcon src="/images/icon-loading.gif" />
      <Text>Loading...</Text>
    </Wrapper>
  );
}
