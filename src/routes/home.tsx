import styled from "styled-components";
import PostBuzzForm from "../components/post-buzz-form";
import Timeline from "../components/timeline";
const MainWrapper = styled.div`
  position: relative;
  padding: 0 3rem;
  display: grid;
  gap: 1rem;
  grid-template-rows: auto 1fr 5fr;
`;

export default function Home() {
  return (
    <MainWrapper>
      <PostBuzzForm />
      <Timeline />
    </MainWrapper>
  );
}
