import { useState } from "react";
import { MainWrapper } from "../components/auth-component";
import PostBuzzForm from "../components/post-buzz-form";
import Timeline, { IBuzz } from "../components/timeline";

export default function Home() {
  const [selectedBuzz, setSelectedBuzz] = useState<IBuzz | null>(null);
  const [showBuzzForm, setShowBuzzForm] = useState(false);

  const handleEdit = (buzz: IBuzz) => {
    setSelectedBuzz(buzz);
  };
  const handleValueChange = (value: boolean) => {
    setShowBuzzForm(value);
  };
  const onSendEditFlag = (flag: boolean) => {
    setShowBuzzForm(flag);
  };
  return (
    <MainWrapper>
      <PostBuzzForm
        {...(selectedBuzz || {})}
        editBtnFlag={showBuzzForm}
        onValueChange={(value) => {
          setTimeout(() => handleValueChange(value), 0);
        }}
      />
      <Timeline
        onEdit={handleEdit}
        showBuzzForm={showBuzzForm}
        onSendEditFlag={(flag) => {
          setTimeout(() => onSendEditFlag(flag), 0);
        }}
      />
    </MainWrapper>
  );
}
