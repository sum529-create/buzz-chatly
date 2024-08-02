import React, { useEffect, useState } from "react";
import { styled } from "styled-components";
import {
  arrayRemove,
  arrayUnion,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { auth, db, storage } from "../firebase";
import { IBuzz, IThumbs } from "./timeline";
import {
  AttachFileInput,
  EditArea,
  PostIconWrapper,
  TextArea,
} from "./post-buzz-form";
import {
  ButtonArea,
  BuzzTime,
  DeleteButton,
  EditButton,
  IconButton,
  IconUsernameWrapper,
  Payload,
  ProfileImage,
  ProfileImageWrapper,
  ProfileTxtWrapper,
  ProfileWrapper,
  Username,
} from "./common-component";
import BuzzReply from "./buzz-reply";

interface IWrapper {
  $isSelected: boolean;
  $isEditFlag: boolean;
}

const Wrapper = styled.div.attrs<IWrapper>(({ $isSelected, $isEditFlag }) => ({
  style: {
    border: `1px solid ${
      $isSelected && $isEditFlag ? "whtie" : "rgba(255, 255, 255, 0.5)"
    }`,
    boxShadow: `${
      $isSelected && $isEditFlag
        ? "0 0 5px rgba(50, 255, 170, 0.5), 0 0 10px rgba(50, 255, 170, 0.5), 0 0 15px rgba(50, 255, 170, 0.5), 0 0 20px rgba(50, 255, 170, 0.5)"
        : "none"
    }`,
    backgroundColor: `${$isSelected && $isEditFlag && "black"}`,
  },
}))<IWrapper>`
  display: grid;
  grid-template-columns: 45px auto;
  padding: 20px;
  border-radius: 15px;
  margin-bottom: 1rem;
  gap: 10px;
`;

export const ColumnStart = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: flex-start;
  justify-content: flex-start;
`;

export const Column = styled.div`
  position: relative;
  display: flex;
  width: 100%;
  flex-direction: column;
  justify-content: center;
`;

const RowStart = styled(ColumnStart)`
  flex-direction: row;
  gap: 10px;
`;

const ImageColumn = styled(Column)`
  width: 100%;
  height: auto;
  object-fit: cover;
`;

const NewBuzzText = styled(TextArea)`
  height: 100px;
  margin: 1rem 0;
`;

const Photo = styled.img`
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  overflow: hidden;
  border-radius: 15px;
  position: relative;
  &.edit_img {
  }
`;

const AttachFileButton = styled.label`
  cursor: pointer;
  color: #fff;
  box-sizing: border-box;
  width: 25px;
`;

const SubIconWrapper = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-content: center;
  p {
    line-height: 1.6;
  }
  gap: 5px;
  margin-top: 10px;
`;

const SubIconButton = styled.div`
  cursor: pointer;
  svg {
    width: 24px;
  }
  &.clicked {
    color: aqua;
    svg {
      fill: #2ecc71;
    }
  }
  &.checked {
    color: #1abc9c;
  }
`;

const SubDataCount = styled.p``;

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
  thumbs,
  onEdit,
  refreshData,
  isSelected,
  onSelect,
  onSendEditFlag,
  showBuzzForm,
  replies,
  profilePic, // 프로필 이미지를 props로 받아옵니다
}: BuzzProps) {
  const [isEditFlag, setIsEditFlag] = useState(false);
  const [newBuzz, setBuzz] = useState(buzz);
  const [file, setFile] = useState<File | null>(null);
  const [previewImg, setPreviewImg] = useState<string | ArrayBuffer | null>(
    null
  );
  const [hidHome, setHidHome] = useState(false);
  const [thumbList, setThumbs] = useState<IThumbs[]>(thumbs || []);
  const [thumbed, setThumbed] = useState(false);
  const [flagReplyForm, setFlagReplyForm] = useState(false);
  const user = auth.currentUser;

  useEffect(() => {
    if (location.pathname === "/") {
      setHidHome(true);
    }
  }, []);
  useEffect(() => {
    if (id && user) {
      const hasValue =
        thumbList.length > 0 &&
        thumbList.filter((e) => e.userId === user.uid).length > 0
          ? true
          : false;
      setThumbed(hasValue);
      // console.log(thumbs.includes(userId));
    }
  }, [buzz]);
  useEffect(() => {
    if (typeof showBuzzForm !== "undefined" || showBuzzForm != null)
      setIsEditFlag(showBuzzForm);
  }, [showBuzzForm]);

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
      onEdit({
        username,
        photo,
        buzz,
        userId,
        id,
        updatedAt,
        createdAt,
        thumbs,
        replies,
      });
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

  const handleThumb = async () => {
    const docRef = doc(db, "buzz", id);

    if (!user) {
      return;
    }
    if (thumbed) {
      await updateDoc(docRef, {
        thumbs: arrayRemove({ userId: user.uid }),
      });
      setThumbed(false);
      setThumbs((e) => e.filter((thumb) => thumb.userId !== user.uid));
    } else {
      await updateDoc(docRef, {
        thumbs: arrayUnion({ userId: user.uid }),
      });
      setThumbed(true);
      setThumbs((e) => [...e, { userId: user.uid }]);
    }
  };

  return (
    <Wrapper
      $isSelected={isSelected && isSelected}
      $isEditFlag={isEditFlag && isEditFlag}
    >
      <ColumnStart>
        <ProfileImageWrapper
          className={profilePic ? "bg-transparent" : "bg-colored"}
        >
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
      </ColumnStart>
      <ColumnStart>
        <Column>
          <ProfileWrapper>
            <ProfileTxtWrapper>
              <IconUsernameWrapper>
                <Username>{username}</Username>

                {user?.uid === userId && (
                  <ButtonArea>
                    {!(isSelected && isEditFlag && !hidHome) && (
                      <>
                        <IconButton onClick={handleEdit}>
                          <svg
                            data-slot="icon"
                            fill="none"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                            className="edit"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                            ></path>
                          </svg>
                        </IconButton>
                        <IconButton onClick={onDelete}>
                          <svg
                            data-slot="icon"
                            fill="none"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                            className="delete"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                            ></path>
                          </svg>
                        </IconButton>
                      </>
                    )}
                  </ButtonArea>
                )}
              </IconUsernameWrapper>
              {!(isSelected && isEditFlag && !hidHome) && (
                <BuzzTime>
                  {formatDate(createdAt) + (updatedAt ? " (수정됨)" : "")}
                </BuzzTime>
              )}
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
        </Column>
        <ImageColumn>
          {isSelected && isEditFlag && !hidHome ? (
            <>
              {previewImg && (
                <>
                  <EditArea onClick={resetImg}>
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
                  <Photo
                    src={previewImg as string}
                    alt="Preview Img"
                    className={
                      isSelected && isEditFlag && !hidHome ? "edit_img" : ""
                    }
                  />
                </>
              )}
            </>
          ) : (
            photo && <Photo src={photo} />
          )}
        </ImageColumn>
        {isSelected && isEditFlag && !hidHome && (
          <Column>
            <PostIconWrapper>
              <ButtonArea>
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
              <ButtonArea>
                <EditButton onClick={onChangeBuzz}>수정</EditButton>
                <DeleteButton onClick={onCancel}>취소</DeleteButton>
              </ButtonArea>
            </PostIconWrapper>
          </Column>
        )}
        {!(isSelected && isEditFlag && !hidHome) && (
          <>
            <Column>
              <RowStart>
                <SubIconWrapper>
                  <SubIconButton
                    onClick={handleThumb}
                    className={thumbed ? "clicked" : ""}
                  >
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
                        d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z"
                      ></path>
                    </svg>
                  </SubIconButton>
                  <SubDataCount>
                    {thumbList ? thumbList.length : 0}
                  </SubDataCount>
                </SubIconWrapper>
                <SubIconWrapper>
                  <SubIconButton
                    onClick={() => setFlagReplyForm((e) => !e)}
                    className={flagReplyForm ? "checked" : ""}
                  >
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
                        d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                      ></path>
                    </svg>
                  </SubIconButton>
                  <SubDataCount>{replies ? replies.length : 0}</SubDataCount>
                </SubIconWrapper>
              </RowStart>
            </Column>
            {flagReplyForm && (
              <Column>
                <BuzzReply
                  userId={userId}
                  id={id}
                  userName={username}
                  replies={replies}
                />
              </Column>
            )}
          </>
        )}
      </ColumnStart>
    </Wrapper>
  );
}
