import styled, { css } from "styled-components";
import React, { MouseEventHandler } from "react";

const StyledButton = styled.button<{ centred: boolean }>`
  background-color: ${(props) => props.theme.colors.buttonBackground.main};
  border-width: 0;
  border-radius: 0.25rem;
  padding: 0.5rem;
  cursor: pointer;

  ${(props) =>
    props.centred
      ? css`
          margin-left: auto;
          margin-right: auto;
        `
      : ""}

  &:hover {
    background-color: ${(props) => props.theme.colors.buttonBackground.hover};
  }
`;

export default function Button({
  onClick,
  label,
  centred = false,
}: {
  onClick?: MouseEventHandler<HTMLButtonElement>;
  label: string;
  centred?: boolean;
}) {
  return (
    <StyledButton centred={centred} type="button" onClick={onClick}>
      {label}
    </StyledButton>
  );
}
