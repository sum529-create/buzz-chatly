import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { db } from "../firebase";
import Buzz from "./buzz";

export interface IBuzz {
  id: string;
  buzz: string;
  createdAt: number;
  photo: string;
  userId: string;
  username: string;
}
const Wrapper = styled.div``;
export default function Timeline() {
  const [buzz, setBuzz] = useState<IBuzz[]>([]);
  const fetchBuzz = async () => {
    const buzzQuery = query(
      collection(db, "buzz"),
      orderBy("createdAt", "desc")
    );
    const spanshot = await getDocs(buzzQuery);
    const buzzs = spanshot.docs.map((doc) => {
      const { buzz, createdAt, photo, userId, username } = doc.data();
      return {
        id: doc.id,
        buzz,
        createdAt,
        photo,
        userId,
        username,
      };
    });
    setBuzz(buzzs);
  };
  useEffect(() => {
    fetchBuzz();
  }, []);
  return (
    <Wrapper>
      {buzz.map((e) => (
        <Buzz key={e.id} {...e} />
      ))}
    </Wrapper>
  );
}
