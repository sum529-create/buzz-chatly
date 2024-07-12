import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { auth } from "../firebase";

const HeaderContainer = styled.header`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  background-color: #f8f9fa;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Logo = styled.div`
  font-size: 24px;
  font-weight: bold;
`;

const Nav = styled.nav`
  flex-grow: 1;
  display: flex;
  justify-content: center;
`;

const NavList = styled.ul`
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
`;

const NavItem = styled.li`
  margin: 0 15px;
`;

const NavLink = styled.a`
  text-decoration: none;
  color: #333;
  &:hover {
    color: #007bff;
  }
`;

const SearchBar = styled.div`
  position: relative;
`;

const SearchInput = styled.input`
  padding: 5px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const UserActions = styled.div`
  display: flex;
  align-items: center;
  color: #333;
`;

const UserActionItem = styled.div`
  margin-left: 20px;
  cursor: pointer;
  &:hover {
    color: #007bff;
  }
`;

export default function BuzzChatlyHeader() {
  const navigate = useNavigate();

  const movePage = (e: string) => {
    navigate("/" + e);
  };

  const logOut = () => {
    auth.signOut();
    location.reload();
  };

  return (
    <HeaderContainer>
      <Logo>Brand</Logo>
      <Nav>
        <NavList>
          <NavItem>
            <NavLink href="#">Home</NavLink>
          </NavItem>
          <NavItem>
            <NavLink href="#">About</NavLink>
          </NavItem>
          <NavItem>
            <NavLink href="#">Services</NavLink>
          </NavItem>
          <NavItem>
            <NavLink href="#">Contact</NavLink>
          </NavItem>
        </NavList>
      </Nav>
      <SearchBar>
        <SearchInput type="text" placeholder="Search..." />
      </SearchBar>
      <UserActions>
        {/* <UserActionItem onClick={() => movePage("login")}>Login</UserActionItem>
        <UserActionItem onClick={() => movePage("create-account")}>
          Sign Up
        </UserActionItem> */}
        <UserActionItem onClick={logOut}>logout</UserActionItem>
      </UserActions>
    </HeaderContainer>
  );
}
