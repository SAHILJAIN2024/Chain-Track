import { SupplyChainCreated as SupplyChainCreatedEvent } from "../generated/CRXFactory/CRXFactory"
import { SupplyChainCreated } from "../generated/schema"

export function handleSupplyChainCreated(event: SupplyChainCreatedEvent): void {
  let entity = new SupplyChainCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.creator = event.params.creator
  entity.contractAddress = event.params.contractAddress
  entity.name = event.params.name
  entity.timestamp = event.params.timestamp

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
