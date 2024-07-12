import styled from "styled-components";
import PostBuzzForm from "../components/post-buzz-form";
const MainWrapper = styled.div`
  position: relative;
  padding: 0 3rem;
`;

export default function Home() {
  return (
    <MainWrapper>
      <PostBuzzForm />
    </MainWrapper>
  );
}
