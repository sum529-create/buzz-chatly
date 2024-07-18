import { Unsubscribe } from "firebase/auth";
import {
  collection,
  // getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { db } from "../firebase";
import Buzz from "./buzz";

export interface IBuzz {
  id: string;
  buzz: string;
  createdAt: number;
  updatedAt: number;
  photo: string;
  userId: string;
  username: string;
}
const Wrapper = styled.div`
  display: flex;
  gap: 10px;
  flex-direction: column;
  overflow-y: scroll;
  flex: 1;
`;

interface TimelineProps {
  onEdit: (buzz: IBuzz) => void;
}

export default function Timeline({ onEdit }: TimelineProps) {
  const [buzz, setBuzz] = useState<IBuzz[]>([]);
  useEffect(() => {
    let unsubscribe: Unsubscribe | null = null;
    const fetchBuzz = async () => {
      const buzzQuery = query(
        // query를 지정해주고,
        collection(db, "buzz"),
        orderBy("createdAt", "desc"),
        // 쿼리 호출을 줄이는것도 비용감면의 한방법이다.
        limit(25) // 페이지네이션 추후 추가, 첫 25개만 불러오도록 설정
      );
      // const spanshot = await getDocs(buzzQuery); // 문서를 불러온다.
      // const buzzs = spanshot.docs.map((doc) => {
      //   const { buzz, createdAt, photo, userId, username } = doc.data();
      //   return {
      //     id: doc.id,
      //     buzz,
      //     createdAt,
      //     photo,
      //     userId,
      //     username,
      //   };
      // });
      // onSnapshop : 특정문자나 컬렉션, 쿼리 이벤트를 감지하여, realtime으로 이벤트 콜백함수 실행, 실시간으로 반영
      // 다만, 추가적인 비용이 청구될 수 있음
      // 이벤트 리스너에 대한 구독은 취소해 둘것, 계속 사용 시 비용 지불됨
      unsubscribe = await onSnapshot(buzzQuery, (snapshot) => {
        const buzzs = snapshot.docs.map((doc) => {
          const { buzz, createdAt, photo, userId, username, updatedAt } =
            doc.data();
          return {
            id: doc.id,
            buzz,
            createdAt,
            photo,
            userId,
            username,
            updatedAt,
          };
        });
        setBuzz(buzzs);
      });
    };
    fetchBuzz();
    return () => {
      // 유저가 로그아웃 or 다른화면에 있을 경우 굳이 이벤트를 실행 할 필요가 없기에 별도처리
      unsubscribe && unsubscribe();
    };
  }, []);
  return (
    <Wrapper>
      {buzz.map((e) => (
        <Buzz key={e.id} {...e} onEdit={onEdit} />
      ))}
    </Wrapper>
  );
}
