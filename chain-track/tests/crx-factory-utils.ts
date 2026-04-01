import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import { SupplyChainCreated } from "../generated/CRXFactory/CRXFactory"

export function createSupplyChainCreatedEvent(
  creator: Address,
  contractAddress: Address,
  name: string,
  timestamp: BigInt
): SupplyChainCreated {
  let supplyChainCreatedEvent = changetype<SupplyChainCreated>(newMockEvent())

  supplyChainCreatedEvent.parameters = new Array()

  supplyChainCreatedEvent.parameters.push(
    new ethereum.EventParam("creator", ethereum.Value.fromAddress(creator))
  )
  supplyChainCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "contractAddress",
      ethereum.Value.fromAddress(contractAddress)
    )
  )
  supplyChainCreatedEvent.parameters.push(
    new ethereum.EventParam("name", ethereum.Value.fromString(name))
  )
  supplyChainCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )

  return supplyChainCreatedEvent
}
