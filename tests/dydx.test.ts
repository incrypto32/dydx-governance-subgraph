import { clearStore, test, assert,log } from "matchstick-as/assembly/index";
import { Proposal } from "../generated/schema";
import {
  DydxGovernor,
  ProposalCanceled,
  ProposalCreated,
  ProposalExecuted,
  ProposalQueued,
} from "../generated/DydxGovernor/DydxGovernor";
import {
  createProposalCreatedEvent,
  handleProposalCreated,
  base58IPFShash,
} from "../src/mapping";
import { Bytes } from "@graphprotocol/graph-ts";

test("Can call mappings with custom events", () => {
  // Call mappings
  let proposalCreatedEvent = createProposalCreatedEvent(
    1,
    "0xf88487bfb6726da59c203c771ade7e1272f42d1c",
    "0xecae9bf44a21d00e2350a42127a377bf5856d84b",
    ["0x6aad0bcfbd91963cf2c8fb042091fd411fb05b3c"],
    [0],
    ["upgradeAndCall(address,address,bytes)"],
    [
      Bytes.fromHexString(
        "0x00000000000000000000000065f7ba4ec257af7c55fd5854e5f6356bbd0fb8ec00000000000000000000000031d76f5db8f40d28886bf00f3be5f157472bf77a000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000048129fc1c00000000000000000000000000000000000000000000000000000000"
      ),
    ],
    [false],
    13538946,
    13604646,
    "0x90dfd35f4a0bb2d30cdf66508085e33c353475d9",
    "0xa21087d039fe569dd88424d4051a7e407c6d80b4fbb389280fc0b0eea9877cbe"
  );

  let a=base58IPFShash(proposalCreatedEvent.params.ipfsHash.toHexString());
  log.info(a,[])
  handleProposalCreated(proposalCreatedEvent)
});
