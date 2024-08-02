import { arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { auth, db, storage } from "../firebase";
import { Column, ColumnStart } from "./buzz";
import {
  ButtonArea,
  BuzzTime,
  CancelButton,
  DeleteButton,
  EditButton,
  Payload,
  ProfileImage,
  ProfileImageWrapper,
  ProfileTxtWrapper,
  ProfileWrapper,
  Username,
} from "./common-component";
import {
  ByteLength,
  Form,
  PostIconWrapper,
  TextArea,
  TextAreaWrapper,
} from "./post-buzz-form";
import { IReply } from "./timeline";
import { v4 as uuidv4 } from "uuid";
interface IBuzzReply {
  userId: string;
  id: string;
  userName: string;
  replies: Array<IReply>;
  profileImg?: string | null;
}

const ReplyForm = styled(Form)`
  border-radius: 0;
  border: none;
  border-top: 2px solid rgb(0, 205, 254);
  background-color: #141d26;
  border-top-right-radius: 20px;
  border-bottom-left-radius: 20px;
`;

const ReplyTextArea = styled(TextArea)`
  background-color: #3c4a56;
`;

const BuzzReplyWrapper = styled.div`
  margin-top: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
`;

const ReplyReceiver = styled.div`
  font-size: 14px;
  line-height: 18px;
  color: #8e8e8e;
  span {
    color: #16a085;
    font-weight: 700;
  }
`;

const ReplyListWrapper = styled.ul``;

const ReplyItemWrapper = styled.li`
  display: grid;
  grid-template-columns: 45px auto 91px;
  padding: 20px;
  gap: 10px;
  position: relative;
  &.editing {
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.5);
  }
  &:not(:last-child)::after {
    content: "";
    background-color: #485460;
    width: 100%;
    height: 1px;
    position: absolute;
    left: 0;
    bottom: 0;
  }
`;

export default function BuzzReply({
  userId,
  id,
  userName,
  replies,
}: IBuzzReply) {
  const user = auth.currentUser;
  const docRef = doc(db, "buzz", id);
  const [replyText, setReplyText] = useState("");
  const [reply, setReply] = useState<IReply[]>(replies || []);
  const [newReplyText, setNewReplyText] = useState("");
  const [avatar, setAvatar] = useState("");
  const [profilePic, setProfilePic] = useState<{
    [key: string]: string | null;
  }>({});
  const [isUpdateIdx, setIsUpdateIdx] = useState<number | null>(null);

  useEffect(() => {
    if (user && user.photoURL) setAvatar(user.photoURL);
    const avatars = async () => {
      const userIdCnt: { [key: string]: number } = replies.reduce(
        (acc, obj) => {
          acc[obj.userId] = (acc[obj.userId] || 0) + 1;
          return acc;
        },
        {} as { [key: string]: number }
      );

      const duplicateUserIds = Object.keys(userIdCnt).filter(
        (e) => userIdCnt[e]
      );

      const seenIds = new Set<string>();
      const duplicates = replies.filter((data) => {
        if (
          duplicateUserIds.includes(data.userId) &&
          !seenIds.has(data.userId)
        ) {
          seenIds.add(data.userId);
          return true;
        }
        return false;
      });

      const fetchingAvatar = duplicates.map(async (b) => {
        if (!id || !reply) return;
        const { userId } = b;
        try {
          const profileDocRef = doc(db, "profile_images", userId);
          const docSnap = await getDoc(profileDocRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data?.hasProfileImage && data?.profileImageUrl) {
              const locationRef = ref(storage, `avatars/${userId}`);
              const url = await getDownloadURL(locationRef);

              return { userId, url };
            }
          }
        } catch (error) {
          console.error(
            `Failed to fetch profile picture for user ${userId}`,
            error
          );
        }
        return { userId, url: null };
      });
      const profilePicResults = await Promise.all(fetchingAvatar);
      const profilePicMap = profilePicResults.reduce((acc, result) => {
        if (result) {
          const { userId, url } = result;
          acc[userId] = url || null;
        }
        return acc;
      }, {} as { [key: string]: string | null });

      setProfilePic((prevProfilePic) => ({
        ...prevProfilePic,
        ...profilePicMap,
      }));
    };
    if (replies) avatars();
  }, [id, reply, replies]);

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReplyText(e.target.value);
  };
  const onResetText = () => {
    setReplyText("");
  };
  const formatDate = (date: number) => {
    const strDate = new Date(date);
    return strDate.toLocaleDateString();
  };
  const fetchReplies = async () => {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data?.replies) {
        setReply(data.replies);
      }
    }
  };
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !replyText || replyText.length > 180) {
      return;
    }
    const newId = uuidv4();
    try {
      await updateDoc(docRef, {
        replies: arrayUnion({
          id: newId,
          buzz: replyText,
          createdAt: formatDate(Date.now()),
          username: user.displayName,
          userId: user.uid,
        }),
      });
      await fetchReplies();
    } catch (error) {
      console.error("send reply error:", error);
    } finally {
      onResetText();
    }
  };

  const deleteReply = async (e: any, i: number) => {
    if (user?.uid !== e.userId) {
      return;
    }
    if (confirm("해당 댓글을 삭제하시겠습니까?")) {
      try {
        const updateReplyLists = [
          ...replies.slice(0, i),
          ...replies.slice(i + 1),
        ];
        await updateDoc(docRef, {
          replies: updateReplyLists,
        });
        await fetchReplies();
      } catch (error) {
        console.error("Failed to delete comments", error);
      }
    }
  };

  const onNewReply = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewReplyText(e.target.value);
  };

  const updateReply = async (e: any, i: number) => {
    if (user?.uid !== e.userId) {
      return;
    }
    setNewReplyText(e.buzz);
    setIsUpdateIdx(i);
  };

  const cancelReply = () => {
    setNewReplyText("");
    setIsUpdateIdx(null);
  };

  const updateNewReply = async (buzz: string) => {
    if (!newReplyText) {
      alert("수정하실 댓글을 입력해주세요.");
      return;
    }
    if (buzz === newReplyText) {
      cancelReply();
      return;
    }
    if (newReplyText.length > 180) {
      alert("텍스트는 180자 이하로 입력해주세요.");
      return;
    }
    if (!isUpdateIdx && isUpdateIdx !== 0) {
      return;
    }
    try {
      const currReplyList = replies;
      if (currReplyList[isUpdateIdx]) {
        currReplyList[isUpdateIdx] = {
          ...replies[isUpdateIdx],
          buzz: newReplyText,
          updatedAt: Date.now(),
        };
      }
      await updateDoc(docRef, {
        replies: replies,
      });
      cancelReply();
      fetchReplies();
    } catch (error) {
      console.error("Failed to edit comments", error);
    }
  };

  return (
    <BuzzReplyWrapper>
      <ReplyForm onSubmit={onSubmit} $isFocused={false}>
        <ProfileWrapper>
          <ProfileImageWrapper
            className={avatar ? "bg-transparent" : "bg-colored"}
          >
            {avatar ? (
              <ProfileImage
                src={avatar}
                alt={`${user?.displayName}'s profile`}
              />
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
            {user?.displayName}
            <ReplyReceiver>
              <span>{userName === user?.displayName ? "나" : userName}</span>
              에게 댓글달기
            </ReplyReceiver>
          </ProfileTxtWrapper>
        </ProfileWrapper>
        <TextAreaWrapper>
          <ReplyTextArea
            required
            rows={5}
            maxLength={180}
            value={replyText}
            placeholder="댓글을 입력하세요."
            onChange={onChange}
          />
          <ByteLength>{"(" + replyText.length + "/ 180)"}</ByteLength>
        </TextAreaWrapper>
        <PostIconWrapper>
          <ButtonArea>
            <EditButton type="submit">등록</EditButton>
            <CancelButton onClick={onResetText}>초기화</CancelButton>
          </ButtonArea>
        </PostIconWrapper>
      </ReplyForm>
      {reply && reply.length > 0 && (
        <ReplyListWrapper>
          {reply.map((e, i) => (
            <ReplyItemWrapper
              key={i}
              className={
                isUpdateIdx === i && user?.uid === e.userId ? "editing" : ""
              }
            >
              <ColumnStart>
                <ProfileImageWrapper
                  className={
                    profilePic[e.userId] ? "bg-transparent" : "bg-colored"
                  }
                >
                  {profilePic[e.userId] ? (
                    <ProfileImage
                      src={profilePic[e.userId] || ""}
                      alt={`${e.username}'s profile`}
                    />
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
                      <Username>{e.username}</Username>
                      <BuzzTime>
                        {e.createdAt + (e.updatedAt ? " (수정됨)" : "")}
                      </BuzzTime>
                    </ProfileTxtWrapper>
                  </ProfileWrapper>
                  {isUpdateIdx === i && user?.uid === e.userId ? (
                    <TextAreaWrapper>
                      <ReplyTextArea
                        required
                        rows={5}
                        maxLength={180}
                        onChange={onNewReply}
                        value={newReplyText}
                      />
                      <ByteLength>
                        {"(" + newReplyText.length + "/ 180)"}
                      </ByteLength>
                    </TextAreaWrapper>
                  ) : (
                    <Payload>{e.buzz}</Payload>
                  )}
                </Column>
              </ColumnStart>
              {user?.uid === e.userId && (
                <ColumnStart>
                  {isUpdateIdx === i ? (
                    <ButtonArea>
                      <EditButton onClick={() => updateNewReply(e.buzz)}>
                        수정
                      </EditButton>
                      <CancelButton onClick={cancelReply}>취소</CancelButton>
                    </ButtonArea>
                  ) : (
                    <ButtonArea>
                      <EditButton onClick={() => updateReply(e, i)}>
                        수정
                      </EditButton>
                      <DeleteButton onClick={() => deleteReply(e, i)}>
                        삭제
                      </DeleteButton>
                    </ButtonArea>
                  )}
                </ColumnStart>
              )}
            </ReplyItemWrapper>
          ))}
        </ReplyListWrapper>
      )}
    </BuzzReplyWrapper>
  );
}
