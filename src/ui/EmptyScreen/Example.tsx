import styled from "styled-components";
import * as React from "react";

const ExampleTitle = styled.div`
  font-weight: bold;
  font-size: 0.8em;
  text-align: left;
`;

const ExampleSubtitle = styled.div`
  font-size: 0.7em;
  text-align: left;
  opacity: 0.8;
  margin-top: 0.5rem;
`;

const ExampleContainer = styled.div`
  margin-top: 1rem;
`;

export function Example({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <ExampleContainer>
      <ExampleTitle>{title}</ExampleTitle>
      {subtitle && <ExampleSubtitle>{subtitle}</ExampleSubtitle>}
      <pre>{children}</pre>
    </ExampleContainer>
  );
}
