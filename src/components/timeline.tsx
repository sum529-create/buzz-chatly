import {
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  Unsubscribe, // Import Unsubscribe from firebase/firestore
} from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { db, storage } from "../firebase";
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
  -ms-overflow-style: none; /* IE, Edge */
  scrollbar-width: none; /* Firefox */
  flex: 1;
  width: 100%;
  &::-webkit-scrollbar {
    display: none;
  }
`;

interface TimelineProps {
  onEdit: (buzz: IBuzz) => void;
  showBuzzForm: boolean;
  onSendEditFlag: (flag: boolean) => void;
}

export default function Timeline({
  onEdit,
  showBuzzForm,
  onSendEditFlag,
}: TimelineProps) {
  const [buzz, setBuzz] = useState<IBuzz[]>([]);
  const [profilePic, setProfilePic] = useState<{
    [key: string]: string | null;
  }>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    setSelectedId(id);
  };

  useEffect(() => {
    const buzzQuery = query(
      collection(db, "buzz"),
      orderBy("createdAt", "desc"),
      limit(25)
    );

    // Create a subscription to Firestore updates
    const unsub: Unsubscribe = onSnapshot(buzzQuery, async (snapshot) => {
      const buzzs: IBuzz[] = snapshot.docs.map((doc) => {
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

      const currentProfilePicMap = { ...profilePic };

      const userIdCnt: { [key: string]: number } = buzzs.reduce((acc, obj) => {
        acc[obj.userId] = (acc[obj.userId] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });

      console.log(userIdCnt);

      const duplicateUserIds = Object.keys(userIdCnt).filter(
        (e) => userIdCnt[e]
      );
      console.log(duplicateUserIds);

      const seenIds = new Set<string>();
      const duplicates = buzzs.filter((data) => {
        if (
          duplicateUserIds.includes(data.userId) &&
          !seenIds.has(data.userId)
        ) {
          seenIds.add(data.userId);
          return true;
        }
        return false;
      });

      console.log(duplicates);

      const profilePicPromises = duplicates.map(async (b) => {
        const { userId } = b;
        if (!userId) return { userId, url: null };

        if (currentProfilePicMap[userId]) {
          return { userId, url: currentProfilePicMap[userId] };
        }

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

      const profilePicResults = await Promise.all(profilePicPromises);
      const profilePicMap = profilePicResults.reduce((acc, { userId, url }) => {
        acc[userId] = url || null;
        return acc;
      }, {} as { [key: string]: string | null });

      setProfilePic((prevProfilePic) => ({
        ...prevProfilePic,
        ...profilePicMap,
      }));
    });

    // Cleanup function to unsubscribe from Firestore updates
    return () => {
      unsub();
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleanup on unmount

  return (
    <Wrapper>
      {buzz.map((e) => (
        <Buzz
          key={e.id}
          {...e}
          onEdit={onEdit}
          onSelect={handleSelect}
          isSelected={e.id === selectedId}
          onSendEditFlag={onSendEditFlag}
          showBuzzForm={showBuzzForm}
          profilePic={profilePic[e.userId] || ""}
        />
      ))}
    </Wrapper>
  );
}
