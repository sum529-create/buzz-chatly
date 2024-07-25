import React, { useEffect, useState } from "react";
import { styled } from "styled-components";
import { deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { auth, db, storage } from "../firebase";
import { IBuzz } from "./timeline";
import { AttachFileInput, TextArea } from "./post-buzz-form";

interface IWrapper {
  $isSelected: boolean;
  $isEditFlag: boolean;
}

const Wrapper = styled.div.attrs<IWrapper>(({ $isSelected, $isEditFlag }) => ({
  style: {
    border: `1px solid ${
      $isSelected && $isEditFlag
        ? "rgba(50, 255, 170, 0.5)"
        : "rgba(255, 255, 255, 0.5)"
    }`,
    boxShadow: `${
      $isSelected && $isEditFlag
        ? "0 0 5px rgba(50, 255, 170, 0.5), 0 0 10px rgba(50, 255, 170, 0.5), 0 0 20px rgba(50, 255, 170, 0.5), 0 0 40px rgba(50, 255, 170, 0.5)"
        : "none"
    }`,
  },
}))<IWrapper>`
  display: grid;
  grid-template-columns: 3fr 1fr;
  padding: 20px;
  border-radius: 15px;
  margin-bottom: 1rem;
`;

const Column = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  &.edit_img_area {
    flex-wrap: wrap;
    align-items: center;
  }
`;

const Photo = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 15px;
  margin: 0 auto;
  &.edit_img {
    margin: 31px 1rem 15px;
  }
`;

export const Username = styled.span`
  font-weight: 600;
  font-size: 18px;
`;

export const Payload = styled.p`
  margin: 10px 0px;
  font-size: 18px;
`;

const ButtonArea = styled.div`
  display: flex;
  gap: 5px;
  &.edit_img_btn {
    margin: 0 auto;
  }
`;

export const IconButton = styled.div`
  /* background-color: tomato;
  text-align: center;
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  padding: 5px 10px;
  border-radius: 5px;
  border: 1px solid tomato; */
  color: white;
  cursor: pointer;
  box-sizing: border-box;
  width: 25px;
`;

export const DeleteButton = styled.button`
  background-color: tomato;
  text-align: center;
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  padding: 5px 10px;
  border-radius: 5px;
  border: 1px solid tomato;
  color: white;
  cursor: pointer;
  box-sizing: border-box;
`;

export const EditButton = styled.button`
  background-color: #1d9bf0;
  color: #fff;
  font-size: 12px;
  text-transform: uppercase;
  border-radius: 5px;
  cursor: pointer;
  padding: 5px 10px;
  box-sizing: border-box;
  border: 1px solid #1d9bf0;
`;

const NewBuzzText = styled(TextArea)`
  height: 100px;
  margin: 1rem 1rem 1rem 0;
`;

const AttachFileButton = styled.label`
  cursor: pointer;
  /* background-color: #1d9bf0; */
  color: #fff;
  /* font-size: 12px; */
  /* text-transform: uppercase;
  border-radius: 5px; */
  /* padding: 5px 10px; */
  box-sizing: border-box;
  width: 25px;
  /* border: 1px solid #1d9bf0; */
`;

export const ProfileWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
`;

export const ProfileImageWrapper = styled.div`
  position: relative;
  width: 50px;
  overflow: hidden;
  height: 50px;
  border-radius: 50%;
  background-color: #079992;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  svg {
    width: 30px;
  }
`;

export const ProfileTxtWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: left;
  flex-wrap: nowrap;
  align-content: center;
  gap: 8px;
`;

export const BuzzTime = styled.div`
  font-size: 14px;
  color: #808e9b;
`;

const ProfileImage = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
`;

interface BuzzProps extends IBuzz {
  onEdit?: (buzz: IBuzz) => void;
  refreshData?: () => void;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onSendEditFlag?: (flag: boolean) => void;
  showBuzzForm?: boolean;
  profilePic?: string | null;
}

export default function Buzz({
  username,
  photo,
  buzz,
  userId,
  id,
  updatedAt,
  createdAt,
  onEdit,
  refreshData,
  isSelected,
  onSelect,
  onSendEditFlag,
  showBuzzForm,
  profilePic, // 프로필 이미지를 props로 받아옵니다
}: BuzzProps) {
  const [isEditFlag, setIsEditFlag] = useState(false);
  const [newBuzz, setBuzz] = useState(buzz);
  const [file, setFile] = useState<File | null>(null);
  const [previewImg, setPreviewImg] = useState<string | ArrayBuffer | null>(
    null
  );
  const [hidHome, setHidHome] = useState(false);

  useEffect(() => {
    if (location.pathname === "/") {
      setHidHome(true);
    }
  }, []);
  useEffect(() => {
    if (typeof showBuzzForm !== "undefined" || showBuzzForm != null)
      setIsEditFlag(showBuzzForm);
  }, [showBuzzForm]);

  const user = auth.currentUser;

  const onDelete = async () => {
    if (user?.uid !== userId) return;
    if (confirm("해당 버즈를 삭제하시겠습니까?")) {
      try {
        await deleteDoc(doc(db, "buzz", id));
        if (photo) {
          const photoRef = ref(storage, `buzz/${user.uid}/${id}`);
          await deleteObject(photoRef);
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleEdit = () => {
    if (user?.uid !== userId) return;
    if (onEdit) {
      onEdit({ username, photo, buzz, userId, id, updatedAt, createdAt });
    }
    onSelect(id);
    setIsEditFlag(true);
    if (onSendEditFlag) onSendEditFlag(true);
    setPreviewImg(photo);
    setBuzz(buzz);
  };

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBuzz(e.target.value);
  };

  const resetImg = async () => {
    if (
      photo &&
      confirm(
        "이미지를 초기화 하시겠습니까?\n초기화 진행시 이미지가 삭제됩니다."
      )
    ) {
      setFile(null);
      setPreviewImg(null);
    }
  };

  const onCancel = () => {
    setIsEditFlag(false);
    if (onSendEditFlag) onSendEditFlag(false);
    setPreviewImg(null);
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

  const onChangeBuzz = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("사용자가 인증되지 않았습니다.");
      return;
    }
    if (!newBuzz) {
      alert("수정하실 텍스트를 입력해주세요!");
      return;
    }
    if (newBuzz.length > 180) {
      alert("텍스트는 180자 이하로 입력해주세요.");
      return;
    }
    try {
      if (photo && !previewImg) {
        const photoRef = ref(storage, `buzz/${userId}/${id}`);
        await deleteObject(photoRef);
      }
      const docRef = doc(db, "buzz", id);
      let url;
      if (file) {
        const locationRef = ref(storage, `buzz/${user.uid}/${id}`);
        const result = await uploadBytes(locationRef, file);
        url = await getDownloadURL(result.ref);
      }
      await updateDoc(docRef, {
        buzz: newBuzz,
        photo: file
          ? url
          : photo !== undefined
          ? photo && !previewImg
            ? null
            : photo
          : null,
        updatedAt: Date.now(),
      });
      setBuzz("");
      setFile(null);
      onCancel();
      refreshData && refreshData();
    } catch (error) {
      console.error("Update Buzz Error: ", error);
    }
  };

  const formatDate = (date: number) => {
    const strDate = new Date(date);
    return strDate.toLocaleDateString();
  };

  return (
    <Wrapper
      $isSelected={isSelected && isSelected}
      $isEditFlag={isEditFlag && isEditFlag}
    >
      <Column>
        <ProfileWrapper>
          <ProfileImageWrapper>
            {profilePic ? (
              <ProfileImage src={profilePic} alt={`${username}'s profile`} />
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
            <Username>{username}</Username>
            <BuzzTime>
              {formatDate(updatedAt ? updatedAt : createdAt) +
                (updatedAt ? " (수정됨)" : "")}
            </BuzzTime>
          </ProfileTxtWrapper>
        </ProfileWrapper>
        {isSelected && isEditFlag && !hidHome ? (
          <NewBuzzText
            required
            rows={5}
            maxLength={180}
            onChange={onChange}
            value={newBuzz}
            placeholder="What is happening?!"
          />
        ) : (
          <Payload>{buzz}</Payload>
        )}
        {user?.uid === userId && (
          <ButtonArea>
            {isSelected && isEditFlag && !hidHome ? (
              <>
                <DeleteButton onClick={onCancel}>취소</DeleteButton>
                <EditButton onClick={onChangeBuzz}>확인</EditButton>
              </>
            ) : (
              <>
                <IconButton onClick={onDelete}>
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
                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                    ></path>
                  </svg>
                </IconButton>
                <IconButton onClick={handleEdit}>
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
                      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                    ></path>
                  </svg>
                </IconButton>
              </>
            )}
          </ButtonArea>
        )}
      </Column>
      <Column
        className={isSelected && isEditFlag && !hidHome ? "edit_img_area" : ""}
      >
        {isSelected && isEditFlag && !hidHome ? (
          <>
            {previewImg && (
              <Photo
                src={previewImg as string}
                alt="Preview Img"
                className={
                  isSelected && isEditFlag && !hidHome ? "edit_img" : ""
                }
              />
            )}
            <ButtonArea className="edit_img_btn">
              {previewImg && (
                <IconButton onClick={resetImg}>
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
                      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                    ></path>
                  </svg>
                </IconButton>
              )}
              <AttachFileButton htmlFor="file">
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
              </AttachFileButton>
              <AttachFileInput
                onChange={onFileChange}
                type="file"
                id="file"
                accept="image/*"
              />
            </ButtonArea>
          </>
        ) : (
          photo && <Photo src={photo} />
        )}
      </Column>
    </Wrapper>
  );
}
