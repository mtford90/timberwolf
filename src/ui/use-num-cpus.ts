import gql from "graphql-tag";
import { useQuery } from "@apollo/client";
import { NumCpus } from "./__generated__/NumCpus";

const NUM_CPUS_QUERY = gql`
  query NumCpus {
    numCpus
  }
`;

export function useNumCpus() {
  const { data } = useQuery<NumCpus>(NUM_CPUS_QUERY);

  return data?.numCpus || null;
}
