import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { styled } from "styled-components";
import { auth, db, storage } from "../firebase";
import { IBuzz } from "./timeline";
import React, { useState } from "react";
import { AttachFileInput, TextArea } from "./post-buzz-form";

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 15px;
  margin-bottom: 1rem;
`;

const Column = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  &.edit_img_area {
    justify-content: flex-end;
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

const Username = styled.span`
  font-weight: 600;
  font-size: 15px;
`;

const Payload = styled.p`
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

export const DeleteButton = styled.button`
  background-color: tomato;
  color: white;
  text-align: center;
  font-weight: 600;
  border: 0;
  font-size: 12px;
  padding: 5px 10px;
  text-transform: uppercase;
  border-radius: 5px;
  cursor: pointer;
  border: 1px solid tomato;
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

interface BuzzProps extends IBuzz {
  onEdit?: (buzz: IBuzz) => void;
  refreshData?: () => void;
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
}: BuzzProps) {
  const [isEditFlag, setIsEditFlag] = useState(false);
  const [newBuzz, setBuzz] = useState(buzz);
  const [file, setFile] = useState<File | null>(null);
  const [previewImg, setPreviewImg] = useState<string | ArrayBuffer | null>(
    null
  );
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
    if (onEdit)
      onEdit({ username, photo, buzz, userId, id, updatedAt, createdAt });
    setIsEditFlag(true);
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
    } else {
      alert("초기화 할 이미지가 없습니다.");
    }
  };
  const onCancel = () => {
    setIsEditFlag(false);
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
        const locationRef = ref(storage, `buzz/${user.uid}/${id}`); // 파일 저장 위치를 직접 지정 할 수 있다.

        const result = await uploadBytes(locationRef, file);
        url = await getDownloadURL(result.ref);
      }

      await updateDoc(docRef, {
        buzz: newBuzz,
        photo: file ? url : photo && !previewImg ? null : photo,
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
  return (
    <Wrapper>
      <Column>
        <Username>{username}</Username>
        {isEditFlag ? (
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
            {isEditFlag ? (
              <>
                <DeleteButton onClick={onCancel}>cancle</DeleteButton>
                <EditButton onClick={onChangeBuzz}>Edit</EditButton>
              </>
            ) : (
              <>
                <DeleteButton onClick={onDelete}>Delete</DeleteButton>
                <EditButton onClick={handleEdit}>Edit</EditButton>
              </>
            )}
          </ButtonArea>
        )}
      </Column>
      <Column className={isEditFlag ? "edit_img_area" : ""}>
        {isEditFlag ? (
          <>
            {previewImg && (
              <Photo
                src={previewImg as string}
                alt="Preview Img"
                className={isEditFlag && "edit_img"}
              />
            )}
            <ButtonArea className="edit_img_btn">
              {previewImg && (
                <DeleteButton onClick={resetImg}>reset</DeleteButton>
              )}
              <AttachFileButton htmlFor="file">Edit</AttachFileButton>
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
