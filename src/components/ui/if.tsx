export const If = ({ exp: condition, children }: React.PropsWithChildren<{ exp: boolean }>) => {
  if (condition) {
    return children;
  }
  return <></>;
};
