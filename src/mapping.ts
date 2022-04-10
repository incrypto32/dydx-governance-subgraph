import {
  BigInt,
  ipfs,
  ethereum,
  Address,
  Bytes,
  log,
  json,
  JSONValue,
} from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as/assembly/index";
import * as base58 from "as-base58";
import {
  DydxGovernor,
  ProposalCanceled,
  ProposalCreated,
  ProposalExecuted,
  ProposalQueued,
} from "../generated/DydxGovernor/DydxGovernor";
import { Proposal } from "../generated/schema";

// Convert a hex string to a byte array
function hexToBytes(hex: string): Uint8Array {
  var bytes = new Uint8Array(Math.ceil(hex.length / 2) as u32);
  for (var i = 0; i < bytes.length; i++)
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16) as u32;
  return bytes;
}

export function handleProposalCreated(event: ProposalCreated): void {
  let proposal = new Proposal(event.params.id.toString());
  proposal.proposalID = event.params.id;

  proposal.creator = event.params.creator.toHexString();

  if (event.params.ipfsHash) {
    let ipfsHash = base58IPFShash(event.params.ipfsHash.toHexString());
    proposal.ipfsHash = ipfsHash;
    let proposalData = ipfs.cat(ipfsHash);

    if (proposalData) {
      let jsondata = json.fromBytes(proposalData);
      let data = jsondata.toObject();
      let title = data.get("title");
      let author = data.get("author");
      let shortDescription = data.get("description");
      let discussions = data.get("discussions");
      let created = data.get("created");
      let basename = data.get("basename");
      let description = data.get("description");

      proposal.title = toValOrNull(title);
      proposal.author = toValOrNull(author);
      proposal.shortDescription = toValOrNull(shortDescription);
      proposal.discussions = toValOrNull(discussions);
      proposal.created = toValOrNull(created);
      proposal.basename = toValOrNull(basename);
      proposal.description = toValOrNull(description);
    }
  }
  proposal.save();
}
function toValOrNull(a: JSONValue | null): string | null {
  if (a) {
    return a.toString();
  }
  return null;
}
export function base58IPFShash(hash: string): string {
  return base58.encode(hexToBytes(`1220${hash.slice(2)}`));
}

export function handleProposalCanceled(event: ProposalCanceled): void {
  let proposal = Proposal.load(event.params.id.toString());
  if (proposal) {
    proposal.canceled = true;
    proposal.save();
  }
}

export function handleProposalExecuted(event: ProposalExecuted): void {
  let proposal = Proposal.load(event.params.id.toString());

  if (proposal) {
    proposal.executed = true;
    proposal.save();
  }
}

export function handleProposalQueued(event: ProposalQueued): void {
  let proposal = Proposal.load(event.params.id.toString());
  if (proposal) {
    proposal.queued = true;
    proposal.save();
  }
}

export function createProposalCreatedEvent(
  id: i32,
  creator: string,
  executor: string,
  targets: string[],
  values: number[],
  signatures: string[],
  calldatas: Bytes[],
  withDelegateCalls: boolean[],
  startBlock: number,
  endBlock: number,
  strategy: string,
  ipfsHash: string
): ProposalCreated {
  let ProposalCreatedEvent = changetype<ProposalCreated>(newMockEvent());

  ProposalCreatedEvent.parameters = new Array();
  let idParam = new ethereum.EventParam("id", ethereum.Value.fromI32(id));
  let creatorParam = new ethereum.EventParam(
    "creator",
    ethereum.Value.fromAddress(Address.fromString(creator))
  );
  let executorParam = new ethereum.EventParam(
    "executor",
    ethereum.Value.fromString(executor)
  );
  let targetsParam = new ethereum.EventParam(
    "targets",
    ethereum.Value.fromArray(
      targets.map<ethereum.Value>((e) =>
        ethereum.Value.fromAddress(Address.fromString(e))
      )
    )
  );
  let valuesParam = new ethereum.EventParam(
    "values",
    ethereum.Value.fromUnsignedBigIntArray(
      values.map<BigInt>((e) => BigInt.fromU64(e as u64))
    )
  );
  let signaturesParam = new ethereum.EventParam(
    "signatures",
    ethereum.Value.fromStringArray(signatures)
  );
  let calldatasParam = new ethereum.EventParam(
    "calldatas",
    ethereum.Value.fromBytesArray(calldatas)
  );
  let startBlockParam = new ethereum.EventParam(
    "startBlock",
    ethereum.Value.fromUnsignedBigInt(BigInt.fromU64(startBlock as u64))
  );
  let endBlockParam = new ethereum.EventParam(
    "endBlock",
    ethereum.Value.fromUnsignedBigInt(BigInt.fromU64(endBlock as u64))
  );
  let strategyParam = new ethereum.EventParam(
    "strategyParam",
    ethereum.Value.fromAddress(Address.fromString(strategy))
  );
  let withDelegateCallsParam = new ethereum.EventParam(
    "withDelegateCalls",
    ethereum.Value.fromBooleanArray(withDelegateCalls)
  );
  let ipfsHashParam = new ethereum.EventParam(
    "ipfsHashParam",
    ethereum.Value.fromBytes(Bytes.fromHexString(ipfsHash))
  );

  ProposalCreatedEvent.parameters.push(idParam);
  ProposalCreatedEvent.parameters.push(creatorParam);
  ProposalCreatedEvent.parameters.push(executorParam);
  ProposalCreatedEvent.parameters.push(targetsParam);
  ProposalCreatedEvent.parameters.push(valuesParam);
  ProposalCreatedEvent.parameters.push(signaturesParam);
  ProposalCreatedEvent.parameters.push(calldatasParam);
  ProposalCreatedEvent.parameters.push(withDelegateCallsParam);
  ProposalCreatedEvent.parameters.push(startBlockParam);
  ProposalCreatedEvent.parameters.push(endBlockParam);
  ProposalCreatedEvent.parameters.push(strategyParam);
  ProposalCreatedEvent.parameters.push(ipfsHashParam);

  return ProposalCreatedEvent;
}
