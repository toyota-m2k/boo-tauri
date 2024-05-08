<script lang="ts">
  import {
    Button,
    ButtonGroup,
    Checkbox,
    Dropdown,
    Input,
    Label,
    Modal,
    NumberInput
  } from "flowbite-svelte";
  import {ChevronDownOutline, PlusOutline, TrashBinSolid} from "flowbite-svelte-icons";
  import {type ColorVariation, colorVariations, settings} from "../model/Settings";
  import {HostInfo} from "../model/HostInfo";
  import {type CompletionProc, viewModel} from "../model/ViewModel";
  import {onMount} from "svelte";
  import {createKeyEvents, keyFor, switchKeyEventCaster} from "../utils/KeyEvents";

  export let completion: CompletionProc<boolean>|undefined
  let addingHost = false
  let editingHost = false
  let hostInfoList = settings.hostInfoList
  let hostList = hostInfoList.list
  let currentHost = settings.currentHost
  let newDisplayName = currentHost ? currentHost.displayName : ""
  let newHostPort = currentHost ? currentHost.port : 3500
  let newHostAddress = currentHost ? currentHost.host : "localhost"
  let slideShowInterval = settings.slideShowInterval
  // let modified = false

  let colorVariation: ColorVariation = "default"
  let isDarkMode = false
  let originalColorVariation: ColorVariation = settings.colorVariation
  let originalDarkMode = settings.isDarkMode

  function isSameHost(h1: HostInfo|undefined, h2: HostInfo|undefined):boolean {
    if(h1===h2) return true
    if(!h1 || !h2) return false
    return h1.host === h2.host && h1.port === h2.port
  }
  // function containsHost(host: HostInfo):boolean {
  //   return hotInfoList.some(h => isSameHost(h, host))
  // }
  // function findHostIndex(host: HostInfo):number {
  //   return hostList.findIndex(h => isSameHost(h, host))
  // }

  function addHost() {
    if(newDisplayName && newHostAddress && newHostPort) {
      const host = new HostInfo(newDisplayName, newHostAddress, newHostPort)
      if(hostInfoList.add(host)) {
        if(!currentHost) {
          currentHost = host
        }
      }
    }
    endAddingHost()
  }

  function deleteHost(host: HostInfo) {
    let index = hostInfoList.remove(host)
    if(index>=0) {
      if(index>=hostList.length) {
        index--
      }
      currentHost = index>=0 ? hostList[index] : undefined
    }
  }

  function endAddingHost() {
    addingHost = false
  }

  async function complete(ok:boolean) {
    if(ok) {
      if(!isSameHost(currentHost,settings.currentHost)) {
          settings.currentHost = currentHost
      }
      if(slideShowInterval!==settings.slideShowInterval) {
        settings.slideShowInterval = slideShowInterval
      }
      if(originalColorVariation!==colorVariation) {
        settings.colorVariation = colorVariation
      }
      if(originalDarkMode!==isDarkMode) {
        settings.isDarkMode = isDarkMode
      }
      await settings.save()
      completion?.(true)
    } else {
      await settings.reset()
      viewModel.isDarkMode.set(originalDarkMode)
      viewModel.colorVariation.set(originalColorVariation)
      completion?.(false)
    }
  }

  onMount(()=>{
    const dlgKeyEvents = createKeyEvents()
      .register(keyFor({key:"Enter", asCode:true}), ()=>complete(true))
      .register(keyFor({key:"Escape", asCode:true}), ()=>complete(false))
      return ()=> { switchKeyEventCaster(dlgKeyEvents) }
  })

  function setDarkMode(sw:boolean) {
    isDarkMode = sw
    viewModel.isDarkMode.set(sw)
  }
  function setColorVariation(theme:ColorVariation) {
    colorVariation = theme
    viewModel.colorVariation.set(theme)
  }

</script>

<Modal title="Settings" open={true} dismissable={false}>
  <div class="default_surface mb-1">
    {#if !addingHost && !editingHost}
      <div class="flex flex-row items-center">
        <Label class="mr-2">Hosts</Label>
        <Button size="xs" class="p-1 secondary_button" on:click={()=>addingHost=true}>
          <PlusOutline class="w-5 h-5 text-primary-on" />
        </Button>
      </div>
      <div class="flex flex-col mt-2">
        {#each hostList as host}
          <div class="flex flex-row items-center justify-between p-2 border-b border-gray-200">
            <div class="flex flex-row">
              <Checkbox checked={currentHost && isSameHost(host,currentHost)} on:click={()=>currentHost=host} class="mr-2 text-accent focus:ring-secondary" />
              <div class="flex flex-col">
                <div class="text-sm">{host.displayName}</div>
                <div class="text-xs text-gray-500">{host.host}:{host.port}</div>
              </div>
            </div>
            <div class="flex flex-row">
              <Button size="xs" class="p-1 other_button" on:click={()=>deleteHost(host)}>
                <TrashBinSolid class="w-4 h-4 text-error" />
              </Button>
            </div>
          </div>
        {/each}
      </div>
      <div>
        <div class="flex items-center mt-2 gap-1">
          <span>Slide Show Interval</span>
          <div class="flex justify-end flex-grow items-center gap-2 pr-4">
          <NumberInput size="sm" min="1" max="3600" bind:value={slideShowInterval} placeholder="Slide Show Interval" class="w-1/6 h-7" />
          <span>second(s)</span>
          </div>
        </div>
        <div class="flex items-center justify-start mt-2 gap-1">
          <span>Color Variation</span>
          <div class="flex justify-end flex-grow items-center pr-4">
            <Button size="sm" class=" secondary_button w-44 h-7">{colorVariation.toUpperCase()}<ChevronDownOutline class="w-6 h-6 ms-2 text-secondary-on" /></Button>
            <Dropdown class="p-3 space-y-3">
              {#each colorVariations as c (c)}
                <li>
                  <Checkbox checked="{colorVariation===c}" on:click={()=>setColorVariation(c)} class="text-surface-on    focus:ring-secondary" >{c.toUpperCase()}</Checkbox>
                </li>
              {/each}
            </Dropdown>
          </div>
        </div>
        <div class="flex items-center justify-start mt-2 gap-1">
          <span>Dark Mode</span>
          <div class="flex justify-end flex-grow items-center pr-4">
            <ButtonGroup>
              <Button size="xs" color="dark" class="h-7" checked={!isDarkMode} on:click={()=>{setDarkMode(false)}}>
                LIGHT
              </Button>
              <Button size="xs" color="dark" class="h-7" checked={isDarkMode} on:click={()=>{setDarkMode(true)}}>
                DARK
              </Button>

            </ButtonGroup>
          </div>
        </div>
      </div>

    {:else}
      <Label>Display name</Label>
      <Input bind:value={newDisplayName} placeholder="Display name" class="mb-2" />
      <Label>Address</Label>
      <Input bind:value={newHostAddress} placeholder="IP Address" class="mb-2" />
      <Label>Port</Label>
      <NumberInput bind:value={newHostPort} placeholder="IP Address" class="mb-2" />

      <div class="flex flex-row items-center justify-center mt-4">
        <Button size="xs" class="default_button mr-4 w-20" on:click={()=>addHost()}>{editingHost?"Apply":"Add"}</Button>
        <Button size="xs" class="other_button w-20" on:click={endAddingHost}>Cancel</Button>
      </div>
    {/if}
  </div>
  <svelte:fragment slot="footer">
    {#if !addingHost && !editingHost}
      <div class="flex flex-row items-center justify-center w-full">
        <Button on:click={()=>complete(true)} class="default_button mr-4 w-20">OK</Button>
        <Button on:click={()=>complete(false)} class="other_button w-20">Cancel</Button>
      </div>
    {/if}
  </svelte:fragment>

</Modal>

<style lang="scss">
  //.positive {
  //  @apply bg-primary text-primary-on;
  //}
  //.negative {
  //  @apply (bg-surface text-surface-on);
  //}
</style>