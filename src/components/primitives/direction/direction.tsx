import {
  component$,
  createContextId,
  Slot,
  useContext,
  useContextProvider,
} from "@builder.io/qwik";

type Direction = "ltr" | "rtl";
const DirectionContext = createContextId<Direction>("direction");

/* -------------------------------------------------------------------------------------------------
 * Direction
 * -----------------------------------------------------------------------------------------------*/

interface DirectionProviderProps {
  dir: Direction;
}
const DirectionProvider = component$<DirectionProviderProps>(({ dir }) => {
  useContextProvider(DirectionContext, dir);
  return <Slot />;
});

/* -----------------------------------------------------------------------------------------------*/

function useDirection(localDir?: Direction) {
  const globalDir = useContext(DirectionContext);
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return localDir || globalDir || "ltr";
}

const Provider = DirectionProvider;

export {
  useDirection,
  //
  Provider,
  //
  DirectionProvider,
};
