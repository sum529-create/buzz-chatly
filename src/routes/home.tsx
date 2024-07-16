import styled from "styled-components";
import PostBuzzForm from "../components/post-buzz-form";
import Timeline from "../components/timeline";
const MainWrapper = styled.div`
  position: relative;
  padding: 50px 3rem;
  display: flex;
  gap: 1rem;
  flex-direction: column;
  height: 100vh;
`;

export default function Home() {
  return (
    <MainWrapper>
      <PostBuzzForm />
      <Timeline />
    </MainWrapper>
  );
}
