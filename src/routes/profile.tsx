import { updateProfile } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { auth, db, storage } from "../firebase";
import { IBuzz } from "../components/timeline";
import Buzz, { DeleteButton, EditButton } from "../components/buzz";
import { MainWrapper } from "../components/auth-component";

const AvatarUpload = styled.label`
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  svg {
    width: 50px;
  }
`;

const AvatarWrapper = styled.div`
  position: relative;
  width: 80px;
  overflow: hidden;
  height: 80px;
  border-radius: 50%;
  background-color: #1d9bf0;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const AvatarImg = styled.img`
  width: 100%;
`;
const AvatarInput = styled.input`
  display: none;
`;
const Name = styled.span`
  font-size: 22px;
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  align-items: center;
  svg {
    width: 16px;
    cursor: pointer;
  }
`;

const EditNameInput = styled.input`
  line-height: 21px;
  box-sizing: border-box;
  border-radius: 3px;
  box-shadow: none;
`;

const Buzzs = styled.div`
  display: flex;
  flex: 1;
  width: 100%;
  flex-direction: column;
  gap: 10px;
  overflow-y: scroll;
`;

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

interface HoverContentProps {
  show: boolean;
}

const AvatarCloseBtn = styled.div<HoverContentProps>`
  display: ${(props) => (props.show ? "block" : "none")};
  width: 100%;
  bottom: 0;
  text-align: center;
  background: tomato;
  position: absolute;
  z-index: 3;
  cursor: pointer;
  animation: ${(props) => props.show && slideUp} 0.3s ease-out;
  svg {
    width: 20px;
  }
`;

export default function Profile() {
  const user = auth.currentUser;
  const [avatar, setAvatar] = useState(user?.photoURL);
  const [buzz, setBuzz] = useState<IBuzz[]>([]);
  const [showEdit, setShowEdit] = useState(false);
  const [newName, setNewName] = useState(user?.displayName);
  const [hovered, setHovered] = useState(false);
  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (!user) return;
    if (files && files.length === 1) {
      const file = files[0];
      const locationRef = ref(storage, `avatars/${user?.uid}`);
      const result = await uploadBytes(locationRef, file);
      const avatarUrl = await getDownloadURL(result.ref);
      setAvatar(avatarUrl);
      await updateProfile(user, {
        photoURL: avatarUrl,
      });
    }
  };
  const fetchData = async () => {
    const buzzQuery = query(
      collection(db, "buzz"),
      where("userId", "==", user?.uid),
      orderBy("createdAt", "desc"),
      limit(25)
    );
    const snapshot = await getDocs(buzzQuery);

    const buzzs = snapshot.docs.map((doc) => {
      const { buzz, createdAt, userId, username, photo, updatedAt } =
        doc.data();
      return {
        buzz,
        createdAt,
        userId,
        username,
        photo,
        updatedAt,
        id: doc.id,
      };
    });
    setBuzz(buzzs);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewName(e.target.value);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showInput = () => {
    setShowEdit((e) => !e);
  };

  const changeEditName = async () => {
    if (!user) {
      return;
    }
    if (newName === "") {
      alert("수정하실 이름을 입력해주세요.");
      return;
    }
    try {
      await updateProfile(user, {
        displayName: newName,
      });
      alert("이름이 수정되었습니다.");
      setShowEdit(false);
    } catch (error) {
      console.error(error);
    }
  };

  const resetAvatar = async () => {
    if (!user) return;
    if (confirm("아바타 이미지를 초기화 하시겠습니까?"))
      try {
        const locationRef = ref(storage, `avatars/${user?.uid}`);
        await deleteObject(locationRef);
        await updateProfile(user, {
          photoURL: null,
        });
        setAvatar(null);
      } catch (error) {
        console.error(error);
      }
  };

  return (
    <MainWrapper>
      <AvatarWrapper
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <AvatarUpload htmlFor="avatar">
          {avatar ? (
            <AvatarImg src={avatar} />
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
        </AvatarUpload>
        {avatar && (
          <AvatarCloseBtn show={hovered ? true : false} onClick={resetAvatar}>
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
          </AvatarCloseBtn>
        )}
        <AvatarInput
          onChange={onAvatarChange}
          id="avatar"
          type="file"
          accept="image/*"
        />
      </AvatarWrapper>
      {!showEdit ? (
        <Name>
          {user?.displayName ?? "Anonymous"}
          <svg
            onClick={showInput}
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
              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
            ></path>
          </svg>
        </Name>
      ) : (
        <Name>
          <EditNameInput
            onChange={onChange}
            value={newName ? newName : ""}
            type="text"
          />
          <EditButton onClick={changeEditName}>확인</EditButton>
          <DeleteButton onClick={() => setShowEdit(false)}>취소</DeleteButton>
        </Name>
      )}
      <Buzzs>
        {buzz.map((e) => (
          <Buzz key={e.id} {...e} refreshData={fetchData} />
        ))}
      </Buzzs>
    </MainWrapper>
  );
}
