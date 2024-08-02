import {
  arrayRemove,
  arrayUnion,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { auth, db, storage } from "../firebase";
import { Column, ColumnStart } from "./buzz";
import {
  ButtonArea,
  BuzzTime,
  DeleteButton,
  EditButton,
  Payload,
  ProfileImage,
  ProfileImageWrapper,
  ProfileTxtWrapper,
  ProfileWrapper,
  Username,
} from "./common-component";
import { Form, PostIconWrapper, TextArea } from "./post-buzz-form";
import { IReply } from "./timeline";

interface IBuzzReply {
  userId: string;
  id: string;
  userName: string;
  replies: Array<IReply>;
  profileImg?: string | null;
}

const BuzzReplyWrapper = styled.div`
  padding-top: 10px;
`;

const ReplyReceiver = styled.div`
  font-size: 14px;
  color: #8e8e8e;
  span {
    color: #16a085;
    font-weight: 700;
  }
`;

const ReplyListWrapper = styled.ul`
  padding: 20px;
`;

const ReplyItemWrapper = styled.li`
  display: grid;
  grid-template-columns: 45px auto 91px;
  padding: 10px 0;
  gap: 10px;
  position: relative;
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
  const [profilePic, setProfilePic] = useState<{
    [key: string]: string | null;
  }>({});

  useEffect(() => {
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
  const onCancel = () => {
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
    try {
      await updateDoc(docRef, {
        replies: arrayUnion({
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
      onCancel();
    }
  };

  const deleteReply = async (e: number) => {
    if (user?.uid !== userId) {
      return;
    }
    if (confirm("해당 댓글을 삭제하시겠습니까?")) {
      try {
        const updateReply = [...replies.slice(0, e), ...replies.slice(e + 1)];
        await updateDoc(docRef, {
          replies: updateReply,
        });
        await fetchReplies();
      } catch (error) {
        console.error("Fail To delete reply", error);
      }
    }
  };

  return (
    <BuzzReplyWrapper>
      <Form onSubmit={onSubmit} $isFocused={false}>
        <ProfileWrapper>
          <ProfileTxtWrapper>
            {user?.displayName}
            <ReplyReceiver>
              <span>{userName === user?.displayName ? "나" : userName}</span>
              에게 답장하기
            </ReplyReceiver>
          </ProfileTxtWrapper>
        </ProfileWrapper>
        <TextArea
          required
          rows={5}
          maxLength={180}
          value={replyText}
          placeholder="댓글을 입력하세요."
          onChange={onChange}
        />
        <PostIconWrapper>
          <ButtonArea>
            <EditButton type="submit">등록</EditButton>
            <DeleteButton onClick={onCancel}>초기화</DeleteButton>
          </ButtonArea>
        </PostIconWrapper>
      </Form>
      {reply && reply.length > 0 && (
        <ReplyListWrapper>
          {reply.map((e, i) => (
            <ReplyItemWrapper key={i}>
              <ColumnStart>
                <ProfileImageWrapper
                  className={profilePic ? "bg-transparent" : "bg-colored"}
                  //   className={"bg-colored"}
                >
                  {profilePic ? (
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
                      <BuzzTime>{e.createdAt}</BuzzTime>
                    </ProfileTxtWrapper>
                  </ProfileWrapper>
                  {/* 분기처리 */}
                  {/* <TextArea required rows={5} maxLength={180} /> */}
                  <Payload>{e.buzz}</Payload>
                </Column>
              </ColumnStart>
              {user?.uid === userId && (
                <ColumnStart>
                  <ButtonArea>
                    <EditButton>수정</EditButton>
                    <DeleteButton onClick={() => deleteReply(i)}>
                      삭제
                    </DeleteButton>
                  </ButtonArea>
                </ColumnStart>
              )}
            </ReplyItemWrapper>
          ))}
        </ReplyListWrapper>
      )}
    </BuzzReplyWrapper>
  );
}
