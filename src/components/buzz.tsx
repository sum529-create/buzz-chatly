import { deleteDoc, doc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { styled } from "styled-components";
import { auth, db, storage } from "../firebase";
import { IBuzz } from "./timeline";

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 15px;
  margin-bottom: 1rem;
`;

const Column = styled.div``;

const Photo = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 15px;
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
`;

const DeleteButton = styled.button`
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

const EditButton = styled.button`
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
  onEdit: (buzz: IBuzz) => void;
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
}: BuzzProps) {
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
    onEdit({ username, photo, buzz, userId, id, updatedAt, createdAt });
  };
  return (
    <Wrapper>
      <Column>
        <Username>{username}</Username>
        <Payload>{buzz}</Payload>
        {user?.uid === userId ? (
          <ButtonArea>
            <DeleteButton onClick={onDelete}>Delete</DeleteButton>
            <EditButton onClick={handleEdit}>Edit</EditButton>
          </ButtonArea>
        ) : null}
      </Column>
      {photo ? (
        <Column>
          <Photo src={photo} />
        </Column>
      ) : null}
    </Wrapper>
  );
}
