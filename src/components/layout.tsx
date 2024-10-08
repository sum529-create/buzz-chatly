/* eslint-disable @typescript-eslint/no-explicit-any */
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { styled } from "styled-components";
import { auth } from "../firebase";
import { ProfileImage, ProfileImageWrapper } from "./common-component";
import { useDataContext } from '../DataContext';

const Wrapper = styled.div`
  /* display: grid; */
  /* gap: 20px; */
  /* grid-template-columns: 1fr 5fr; */
  display: flex;
  flex-direction: column;
  height: 100%;
  /* padding: 50px 0px; */
  width: 100%;
  max-width: 860px;
`;
const BottomMenu = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 768px;
  gap: 20px;
  background-color: #222f3e;
  padding: 5px 0;
  position: fixed;
  bottom: 0;
  justify-content: space-evenly;
  @media (max-width: 768px) {
    width: 100%;
    max-width: 100%;
  }
`;

const TopMenu = styled(BottomMenu)`
  top: 0;
  position: relative;
`;

const MenuItem = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #e0e0e0;
  height: 40px;
  width: 40px;
  border-radius: 50%;
  overflow: hidden;
  svg {
    width: 30px;
    fill: #e0e0e0;
  }
  &.log-out {
    border-color: tomato;
    svg {
      fill: tomato;
    }
  }
  img {
    width: 40px;
  }
  &.logo {
    border: none;
  }
  @media (max-width: 768px) {
    width: 6.5vw;
    height: 6.5vw;
    min-width: 32px;
    min-height: 32px;
    margin: 0 12px;
  }
`;

const MenuProfileImageWrapper = styled(ProfileImageWrapper)`
  width: 40px;
  height: 40px;
`;

const MenuProfileImage = styled(ProfileImage)`
  width: auto !important;
  height: 40px;
`;

export default function Layout() {
  const [user, setUser] = useState<any>(auth.currentUser);
  const [photoURL, setPhotoURL] = useState<string | undefined>(user?.photoURL);
  const { profileData } = useDataContext();
  const navigate = useNavigate();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: any) => {
      if (user) {
        setUser(user);
        setPhotoURL(user.photoURL);
      } else {
        setUser(null);
        setPhotoURL(undefined);
      }
    });

    return () => unsubscribe();
  }, []);
  useEffect(() => {
    if (user && user.photoURL !== photoURL) {
      setPhotoURL(user.photoURL);
    }
  }, [user, photoURL]);
  const onLogOut = async () => {
    const ok = confirm("로그아웃 하시겠습니까?");
    if (ok) {
      await auth.signOut();
      navigate("/login");
    }
  };
  return (
    <Wrapper>
      <TopMenu>
        <Link to="/">
          <MenuItem className="logo">
            <img src="/images/logo.png" alt="buzz chatly logo" />
          </MenuItem>
        </Link>
      </TopMenu>
      <Outlet />
      <BottomMenu>
        <Link to="/">
          <MenuItem>
            <svg
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                clipRule="evenodd"
                fillRule="evenodd"
                d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z"
              />
            </svg>
          </MenuItem>
        </Link>
        <Link to="/profile">
          <MenuItem>
            {photoURL ? (
              <MenuProfileImageWrapper>
                <MenuProfileImage
                  src={profileData ? profileData.imgUrl : photoURL}
                  alt={`${user.displayName}'s profile`}
                />
              </MenuProfileImageWrapper>
            ) : (
              <svg
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
              </svg>
            )}
          </MenuItem>
        </Link>
        <MenuItem onClick={onLogOut} className="log-out">
          <svg
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              clipRule="evenodd"
              fillRule="evenodd"
              d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z"
            />
            <path
              clipRule="evenodd"
              fillRule="evenodd"
              d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-.943a.75.75 0 10-1.004-1.114l-2.5 2.25a.75.75 0 000 1.114l2.5 2.25a.75.75 0 101.004-1.114l-1.048-.943h9.546A.75.75 0 0019 10z"
            />
          </svg>
        </MenuItem>
      </BottomMenu>
    </Wrapper>
  );
}
