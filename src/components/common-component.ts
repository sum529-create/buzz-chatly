// Buzz

import styled from "styled-components";

export const ProfileWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
`;

export const ProfileImageWrapper = styled.div`
  position: relative;
  width: 45px;
  height: 45px;
  overflow: hidden;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  svg {
    width: 30px;
  }
  &.bg-colored {
    background-color: #079992;
  }
  &.bg-transparent {
    background-color: transparent;
    border: 1px solid #2f3640;
  }
`;

export const ProfileImage = styled.img`
  height: 45px;
  border-radius: 50%;
`;

export const ProfileTxtWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: left;
  flex: 1;
`;

export const IconUsernameWrapper = styled.div`
  display: flex;
  gap: 10px;
  justify-content: space-between;
  flex-wrap: nowrap;
  align-items: center;
`;

export const Username = styled.span`
  font-weight: 600;
  font-size: 18px;
  line-height: 23px;
`;

export const ButtonArea = styled.div`
  display: flex;
  gap: 5px;
  &.edit_img_btn {
    margin: 0 auto;
  }
`;

export const DeleteButton = styled.button`
  background-color: tomato;
  text-align: center;
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  padding: 5px 10px;
  border-radius: 5px;
  border: 1px solid tomato;
  color: white;
  cursor: pointer;
  box-sizing: border-box;
  &:hover,
  &:active {
    opacity: 0.9;
  }
`;

export const CancelButton = styled(DeleteButton)`
  background-color: #4f4f4f;
  border-color: #4f4f4f;
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
  vertical-align: top;
  text-align: center;
  border: 1px solid #1d9bf0;
  &:hover,
  &:active {
    opacity: 0.9;
  }
`;

export const SubmitButton = styled.input`
  background-color: #0fb9b1;
  color: white;
  padding: 0 19px;
  border-radius: 20px;
  font-size: 16px;
  cursor: pointer;
  min-width: 75px;
  line-height: 36px;
  height: 36px;
  vertical-align: top;
  text-align: center;
  border: 1px solid #0fb9b1;
  &:hover,
  &:active {
    opacity: 0.9;
  }
`;

export const IconButton = styled.div`
  color: white;
  cursor: pointer;
  box-sizing: border-box;
  width: 25px;
  svg.delete {
    color: tomato;
  }
  svg.edit {
    color: #55e6c1;
  }
`;

export const BuzzTime = styled.div`
  font-size: 14px;
  color: #808e9b;
  line-height: 19px;
`;

export const Payload = styled.p`
  margin: 10px 0px;
  font-size: 18px;
  line-height: 23px;
`;
