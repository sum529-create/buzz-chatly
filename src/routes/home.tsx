import { useState } from "react";
import styled from "styled-components";
import PostBuzzForm from "../components/post-buzz-form";
import Timeline, { IBuzz } from "../components/timeline";
const MainWrapper = styled.div`
  position: relative;
  padding: 50px 3rem;
  display: flex;
  gap: 1rem;
  flex-direction: column;
  height: 100vh;
`;

export default function Home() {
  const [selectedBuzz, setSelectedBuzz] = useState<IBuzz | null>(null);

  const handleEdit = (buzz: IBuzz) => {
    setSelectedBuzz(buzz);
  };
  return (
    <MainWrapper>
      {selectedBuzz ? <PostBuzzForm {...selectedBuzz} /> : <PostBuzzForm />}
      <Timeline onEdit={handleEdit} />
    </MainWrapper>
  );
}
