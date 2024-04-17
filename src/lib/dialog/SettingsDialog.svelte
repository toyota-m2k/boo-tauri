<script lang="ts">
  import {Button, Checkbox, Input, Label, Modal, NumberInput} from "flowbite-svelte";
  import {PlusOutline, TrashBinSolid} from "flowbite-svelte-icons";
  import {settings} from "../Settings";
  import {HostInfo} from "../HostInfo";
  import type {CompletionProc} from "../ViewModel";

  export let completion: CompletionProc<boolean>|undefined
  let addingHost = false
  let editingHost = false
  let hostList = [...settings.hostInfoList]
  let currentHost = settings.currentHost
  let newDisplayName = currentHost ? currentHost.displayName : ""
  let newHostPort = currentHost ? currentHost.port : 3500
  let newHostAddress = currentHost ? currentHost.host : "localhost"
  let modified = false

  function isSameHost(h1: HostInfo|undefined, h2: HostInfo|undefined):boolean {
    if(h1===h2) return true
    if(!h1 || !h2) return false
    return h1.host === h2.host && h1.port === h2.port
  }
  function containsHost(host: HostInfo):boolean {
    return hostList.some(h => isSameHost(h, host))
  }
  function findHostIndex(host: HostInfo):number {
    return hostList.findIndex(h => isSameHost(h, host))
  }

  function addHost() {
    if(newDisplayName && newHostAddress && newHostPort) {
      const host = new HostInfo(newDisplayName, newHostAddress, newHostPort)
      const index = findHostIndex(host)
      if(index>=0) {
        if(hostList[index].displayName!==newDisplayName) {
          currentHost = host
          hostList[index] = host
          modified = true
        }
      } else {
        if (!containsHost(host)) {
          hostList.push(host)
          modified = true
        }
      }
    }
    endAddingHost()
  }

  function deleteHost(host: HostInfo) {
    const index = findHostIndex(host)
    if(index>=0) {
      modified = true
      hostList = hostList.toSpliced(index, 1)

      if(isSameHost(currentHost, host)) {
        currentHost = undefined
        if(hostList.length>0) {
          if(index>0) {
            currentHost = hostList[index-1]
          } else {
            currentHost = hostList[0]
          }
        }
        modified = true
      }
    }
  }

  function endAddingHost() {
    addingHost = false
  }

  async function complete(ok:boolean) {
    if(ok) {
      if(modified) {
          settings.hostInfoList = hostList
      }
      if(!isSameHost(currentHost,settings.currentHost)) {
          settings.currentHost = currentHost
      }
      await settings.save()
      completion?.(true)
    } else {
      completion?.(false)
    }
  }

</script>

<Modal title="Settings" open={true} dismissable={false}>
  <div class="mb-6">
    {#if !addingHost && !editingHost}
      <div class="flex flex-row items-center">
        <Label class="mr-2">Hosts</Label>
        <Button color="primary" size="xs" class="p-1" on:click={()=>addingHost=true}>
          <PlusOutline class="w-5 h-5 text-white" />
        </Button>
      </div>
      <div class="flex flex-col mt-2">
        {#each hostList as host}
          <div class="flex flex-row items-center justify-between p-2 border-b border-gray-200">
            <div class="flex flex-row">
              <Checkbox checked={currentHost && isSameHost(host,currentHost)} on:click={()=>currentHost=host} class="mr-2" />
              <div class="flex flex-col">
                <div class="text-sm">{host.displayName}</div>
                <div class="text-xs text-gray-500">{host.host}:{host.port}</div>
              </div>
            </div>
            <div class="flex flex-row">
              <Button size="xs" color="alternative" class="p-1" on:click={()=>deleteHost(host)}>
                <TrashBinSolid class="w-4 h-4 text-red-500" />
              </Button>
            </div>
          </div>
        {/each}
      </div>

    {:else}
      <Label>Display name</Label>
      <Input bind:value={newDisplayName} placeholder="Display name" class="mb-2" />
      <Label>Address</Label>
      <Input bind:value={newHostAddress} placeholder="IP Address" class="mb-2" />
      <Label>Port</Label>
      <NumberInput bind:value={newHostPort} placeholder="IP Address" class="mb-2" />

      <div class="flex flex-row items-center justify-center mt-2">
        <Button color="primary" size="xs" class="mr-2 w-20" on:click={()=>addHost()}>{editingHost?"Apply":"Add"}</Button>
        <Button color="alternative" size="xs" class="w-20" on:click={endAddingHost}>Cancel</Button>
      </div>
    {/if}
  </div>
  <svelte:fragment slot="footer">
    {#if !addingHost && !editingHost}
      <Button on:click={()=>complete(true)} class="mr-2">OK</Button>
      <Button color="alternative" on:click={()=>complete(false)}>Cancel</Button>
    {/if}
  </svelte:fragment>

</Modal>