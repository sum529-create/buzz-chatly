import { addDoc, collection, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React, { useState } from "react";
import { styled } from "styled-components";
import { auth, db, storage } from "../firebase";

const FormTitle = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
  display: flex;
  gap: 4px;
  justify-content: flex-start;
  svg {
    width: 34px;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const TextArea = styled.textarea`
  border: 2px solid white;
  padding: 20px;
  border-radius: 20px;
  font-size: 16px;
  color: white;
  background-color: black;
  width: 100%;
  resize: none;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  &::placeholder {
    font-size: 16px;
  }
  &:focus {
    outline: none;
    border-color: #1d9bf0;
  }
`;

const AttachFileButton = styled.label`
  padding: 10px 0px;
  color: #1d9bf0;
  text-align: center;
  border-radius: 20px;
  border: 1px solid #1d9bf0;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
`;

const PreviewImg = styled.img`
  margin: 0 auto;
  max-height: 300px;
  @media (max-width: 768px) {
    width: 100%;
    height: 100%;
    max-height: 100%;
  }
`;

const AttachFileInput = styled.input`
  display: none;
`;

const SubmitBtn = styled.input`
  background-color: #1d9bf0;
  color: white;
  border: none;
  padding: 10px 0px;
  border-radius: 20px;
  font-size: 16px;
  cursor: pointer;
  &:hover,
  &:active {
    opacity: 0.9;
  }
`;

export default function PostBuzzForm() {
  const [isLoading, setLoading] = useState(false);
  const [buzz, setBuzz] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewImg, setPreviewImg] = useState<string | ArrayBuffer | null>(
    null
  );
  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBuzz(e.target.value);
  };
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;

    if (files && files.length === 1) {
      const MAX_FILE_SIZE = 1 * 1024 * 1024 * 1024; // 1GB
      if (files[0].size > MAX_FILE_SIZE) {
        alert(
          "파일 크기는 최대 1GB까지 업로드가 가능합니다.\n업로드 하실 파일 사이즈를 다시 확인 후 업로드 해주세요."
        );
        e.target.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImg(reader.result);
      };
      reader.readAsDataURL(files[0]);

      setFile(files[0]);
    }
  };
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || isLoading || buzz === "" || buzz.length > 180) return;
    try {
      setLoading(true);
      const doc = await addDoc(collection(db, "buzz"), {
        buzz,
        createdAt: Date.now(),
        username: user.displayName || "Anonymous",
        userId: user.uid,
      });
      if (file) {
        const locationRef = ref(
          storage,
          `buzz/${user.uid}-${user.displayName}/${doc.id}`
        ); // 파일 저장 위치를 직접 지정 할 수 있다.

        const result = await uploadBytes(locationRef, file);
        const url = await getDownloadURL(result.ref); // 방금 업로드 한 이미지 파일의 url

        await updateDoc(doc, {
          photo: url,
        });
      }
      setBuzz("");
      setFile(null);
    } catch (error) {
      console.error("error! : ", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <FormTitle>
        <svg
          data-slot="icon"
          fill="none"
          stroke-width="1.5"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 0 8.835-2.535m0 0A23.74 23.74 0 0 0 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 0 1 0 3.46"
          ></path>
        </svg>
        Today's buzz
      </FormTitle>
      <Form onSubmit={onSubmit}>
        <TextArea
          required
          rows={5}
          maxLength={180}
          onChange={onChange}
          value={buzz}
          placeholder="What is happening?!"
        />
        {previewImg && (
          <PreviewImg src={previewImg as string} alt="Preview Img" />
        )}
        <AttachFileButton htmlFor="file">
          {file ? "Photo added ✅" : "Add photo"}
        </AttachFileButton>
        <AttachFileInput
          onChange={onFileChange}
          type="file"
          id="file"
          accept="image/*"
        />
        <SubmitBtn
          type="submit"
          value={isLoading ? "Posting..." : "Post Buzz"}
        />
      </Form>
    </>
  );
}
