import { addDoc, collection, doc, getDoc, updateDoc } from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import React, { useEffect, useState } from "react";
import { styled } from "styled-components";
import { auth, db, storage } from "../firebase";
import {
  ButtonArea,
  CancelButton,
  EditButton,
  ProfileImage,
  ProfileImageWrapper,
  ProfileTxtWrapper,
  ProfileWrapper,
  Username,
} from "./common-component";
import { IBuzz } from "./timeline";

const FormTitle = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  align-items: center;
  width: 100%;
  margin: 10px 0;
  svg {
    width: 24px;
  }
  .title-wrapper {
    font-size: 1.5rem;
    display: flex;
    gap: 4px;
    justify-content: flex-start;
    flex-wrap: nowrap;
    align-items: center;
  }
  .buzz_flag_btn {
    cursor: pointer;
    border: 1px solid #fff;
    border-radius: 50%;
    width: 24px;
  }
  .close_btn {
    color: tomato;
    border-color: tomato;
  }
`;

export const Form = styled.form<{ $isFocused: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
  width: 100%;
  padding: 10px 20px;
  background-color: black;
  border-radius: 20px;
  border: 1px solid #e7e9ea;
  ${({ $isFocused }) =>
    $isFocused &&
    `
    border-color: #78e08f;
  `}
`;

export const TextArea = styled.textarea`
  border: 1px solid transparent;
  height: 66px;
  padding: 10px 20px;
  line-height: 1.5;
  font-size: 16px;
  color: white;
  width: 100%;
  resize: none;
  background-color: #222;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  &::placeholder {
    font-size: 16px;
  }
  &:focus {
    outline: none;
  }
`;

export const TextAreaWrapper = styled.div`
  position: relative;
`;

export const ByteLength = styled.p`
  position: absolute;
  padding: 9px 0;
  color: #aaa;
  font-size: 15px;
  line-height: 1;
  text-align: right;
  right: 17px;
  bottom: 2px;
`;

export const PostIconWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px 0px;
  flex-wrap: nowrap;
  align-items: center;
  position: relative;
  margin-top: 20px;
  &::before {
    content: "";
    margin: 0 auto;
    position: absolute;
    top: -10px;
    left: 0;
    width: 100%;
    height: 1px;
    background-color: rgb(47, 51, 54);
  }
`;

const AttachFileButton = styled.label`
  color: #55e6c1;
  text-align: center;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  svg {
    width: 30px;
  }
`;

const PreviewImg = styled.img`
  margin: 0 auto;
  padding: 1.5rem 0;
  max-height: 300px;
  @media (max-width: 768px) {
    width: 100%;
    height: 100%;
    max-height: 100%;
  }
`;

export const AttachFileInput = styled.input`
  display: none;
`;

const ImageDeleteButton = styled.div``;

export const EditArea = styled.div`
  width: 100%;
  position: relative;
  svg {
    width: 34px;
    position: absolute;
    right: 0;
    top: 0;
    z-index: 10;
    cursor: pointer;
  }
`;

interface PostBuzzFormProps extends Partial<IBuzz> {
  onValueChange: (value: boolean) => void;
  editBtnFlag: boolean;
}

export default function PostBuzzForm({
  photo,
  buzz,
  id,
  userId,
  onValueChange,
  editBtnFlag,
}: PostBuzzFormProps) {
  const [isLoading, setLoading] = useState(false);
  const [newBuzz, setBuzz] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewImg, setPreviewImg] = useState<string | ArrayBuffer | null>(
    null
  );
  const [showBuzzForm, setShowBuzzForm] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [userNm, setUserNm] = useState<string | null>(null);

  useEffect(() => {
    const getAvatar = async () => {
      const user = auth.currentUser;
      if (!user?.uid) {
        return;
      } else {
        setUserNm(user?.displayName);
      }
      try {
        const profileDocRef = doc(db, "profile_images", user?.uid);
        const docSnap = await getDoc(profileDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data?.hasProfileImage && data?.profileImageUrl) {
            const loactionRef = ref(storage, `avatars/${user?.uid}`);
            const url = await getDownloadURL(loactionRef);
            setAvatar(url);
          }
        } else {
          setAvatar(null);
        }
      } catch (error) {
        console.error("Fail to fetch profile picture", error);
      }
    };
    getAvatar();
  }, [id]);

  useEffect(() => {
    if (editBtnFlag) {
      if (buzz !== undefined) {
        setBuzz(buzz);
      }
      if (photo !== undefined) {
        setPreviewImg(photo);
      }
    }
    setShowBuzzForm(editBtnFlag);
  }, [editBtnFlag, buzz, photo]);

  // useEffect(() => {
  //   if (buzz !== undefined) {
  //     setBuzz(buzz);
  //     openBuzzForm();
  //   }
  //   if (photo !== undefined) {
  //     setPreviewImg(photo);
  //   }
  // }, [buzz, photo]);

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
    if (!user || isLoading || newBuzz === "" || newBuzz.length > 180) return;
    try {
      setLoading(true);
      let docRef;

      // id가 존재하면 기존 Buzz 업데이트, 그렇지 않으면 새 Buzz 추가
      if (id && editBtnFlag) {
        if (photo && !previewImg) {
          const photoRef = ref(storage, `buzz/${userId}/${id}`);
          await deleteObject(photoRef);
        }
        docRef = doc(db, "buzz", id);
        await updateDoc(docRef, {
          buzz: newBuzz,
          photo:
            photo !== undefined ? (photo && !previewImg ? null : photo) : null,
          updatedAt: Date.now(),
        });
      } else {
        docRef = await addDoc(collection(db, "buzz"), {
          buzz: newBuzz,
          createdAt: Date.now(),
          username: user.displayName || "Anonymous",
          userId: user.uid,
          thumbs: [],
        });
      }

      if (file) {
        const locationRef = ref(storage, `buzz/${user.uid}/${docRef.id}`); // 파일 저장 위치를 직접 지정 할 수 있다.

        const result = await uploadBytes(locationRef, file);
        const url = await getDownloadURL(result.ref); // 방금 업로드 한 이미지 파일의 url

        await updateDoc(docRef, {
          photo: url,
        });
      }
      setBuzz("");
      setFile(null);
      setPreviewImg(null);
      setShowBuzzForm(true);
      onValueChange(false);
    } catch (error) {
      console.error("error! : ", error);
    } finally {
      setLoading(false);
    }
  };
  const closeImg = () => {
    setFile(null);
    setPreviewImg(null);
  };
  const openBuzzForm = (type?: string) => {
    closeImg();
    setBuzz("");
    setShowBuzzForm((e) => {
      const newState = !e;
      if (type !== "add") onValueChange(newState);
      return newState;
    });
  };
  return (
    <>
      <FormTitle>
        <div className="title-wrapper">
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
              d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 0 8.835-2.535m0 0A23.74 23.74 0 0 0 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 0 1 0 3.46"
            ></path>
          </svg>
          <h1>Today's buzz</h1>
        </div>
        {!showBuzzForm ? (
          <svg
            onClick={() => openBuzzForm("add")}
            data-slot="icon"
            fill="none"
            strokeWidth="1.5"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="buzz_flag_btn add_btn"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            ></path>
          </svg>
        ) : (
          <svg
            onClick={() => openBuzzForm()}
            data-slot="icon"
            fill="none"
            strokeWidth="1.5"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="buzz_flag_btn close_btn"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 12h14"
            ></path>
          </svg>
        )}
      </FormTitle>
      {showBuzzForm ? (
        <Form onSubmit={onSubmit} $isFocused={isFocused}>
          <ProfileWrapper>
            <ProfileImageWrapper
              className={avatar ? "bg-transparent" : "bg-colored"}
            >
              {avatar ? (
                <ProfileImage src={avatar} alt={`${userNm}'s profile`} />
              ) : (
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
              )}
            </ProfileImageWrapper>
            <ProfileTxtWrapper>
              <Username>{userNm}</Username>
            </ProfileTxtWrapper>
          </ProfileWrapper>
          <TextAreaWrapper>
            <TextArea
              required
              rows={5}
              maxLength={180}
              onChange={onChange}
              value={newBuzz}
              placeholder="무슨 일이 일어나고 있나요?"
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
            <ByteLength>{"(" + newBuzz.length + "/ 180)"}</ByteLength>
          </TextAreaWrapper>
          {previewImg && (
            <>
              <EditArea onClick={closeImg}>
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
                    d="M6 18 18 6M6 6l12 12"
                  ></path>
                </svg>
              </EditArea>
              <PreviewImg src={previewImg as string} alt="Preview Img" />
            </>
          )}
          <PostIconWrapper>
            <AttachFileButton htmlFor="file">
              {file ? (
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
                    d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  ></path>
                </svg>
              ) : (
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
                    d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                  ></path>
                </svg>
              )}
            </AttachFileButton>
            <AttachFileInput
              onChange={onFileChange}
              type="file"
              id="file"
              accept="image/*"
            />
            {previewImg && (
              <ImageDeleteButton onClick={closeImg}>
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
                    d="M6 18 18 6M6 6l12 12"
                  ></path>
                </svg>
              </ImageDeleteButton>
            )}
            <ButtonArea>
              <EditButton type="submit">
                {isLoading ? "Posting..." : editBtnFlag ? "수정" : "게시"}
              </EditButton>
              {editBtnFlag && (
                <CancelButton onClick={() => openBuzzForm()}>취소</CancelButton>
              )}
            </ButtonArea>
          </PostIconWrapper>
        </Form>
      ) : null}
    </>
  );
}
