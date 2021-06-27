
import React, { useCallback, useState } from "react";
import { render, fireEvent, queryByTestId, wait } from "@testing-library/react";
import { useReq } from "./useReq";
import { errorModes } from "../../error"

const TestUseReq: React.FC<any> = ({ req }) => {
  const [skip, setSkip] = useState(true);
  const callback = useCallback(() => req(), [req])
  const { data, loading, error } = useReq(callback, "default", errorModes.IGNORE, skip);

  return (
    <React.Fragment>
      <span data-testid="data">{String(data)}</span>
      {loading && <span data-testid="loading" /> }
      {error && <span data-testid="error" /> }
      <button onClick={() => setSkip(!skip)}>toggle skip</button>
    </React.Fragment>
  );
}

test("renders initial state correctly", () => {
  const { container, getByTestId,  } = render(<TestUseReq/>);

  expect(getByTestId("data").textContent).toBe("default");
  expect(queryByTestId(container, 'loading')).toBeInTheDocument()
  expect(queryByTestId(container, 'error')).not.toBeInTheDocument()
})

test("renders successful response correctly", async () => {
  const req = jest.fn();
  req.mockReturnValue(Promise.resolve("resolved"));

  const { container, getByTestId, getByText } = render(<TestUseReq req={req}/>);
  fireEvent.click(getByText("toggle skip"));

  await wait(() => {
    expect(queryByTestId(container, 'loading')).not.toBeInTheDocument()
  })
  expect(getByTestId("data").textContent).toBe("resolved");
  expect(queryByTestId(container, 'error')).not.toBeInTheDocument()
  expect(req).toHaveBeenCalledTimes(1);
});

test("renders unsuccessful response correctly", async () => {
  const req = jest.fn();
  req.mockReturnValue(Promise.reject("rejeted"));

  const { container, getByTestId, getByText } = render(<TestUseReq req={req}/>);
  fireEvent.click(getByText("toggle skip"));

  await wait(() => {
    expect(queryByTestId(container, 'loading')).not.toBeInTheDocument()
  })
  expect(getByTestId("data").textContent).toBe("default");
  expect(queryByTestId(container, 'error')).toBeInTheDocument()
  expect(req).toHaveBeenCalledTimes(1);
});

test("doesn't do any state updates when unmounted", async () => {
  const req = jest.fn();
  req.mockReturnValue(Promise.reject("rejeted"));

  const { getByText, unmount } = render(<TestUseReq req={req}/>);
  fireEvent.click(getByText("toggle skip"));
  unmount();

  // throws exception if state update is done after unmount..
});