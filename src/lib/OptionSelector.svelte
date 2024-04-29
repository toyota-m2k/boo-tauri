<script lang="ts">

  import {viewModel} from './model/ViewModel'
  import {Button, ButtonGroup, Label} from 'flowbite-svelte'
  import SvgIcon from './common/SvgIcon.svelte'
  import {ICON_AUDIO, ICON_PHOTO, ICON_VIDEO} from './Icons'
  import {createEventDispatcher, tick} from 'svelte'
  import {launch} from './utils/Utils'
  import type {CurrentValueStore} from './utils/CurrentValueStore'

  const dispatch = createEventDispatcher();
  const typeSelectable = viewModel.typeSelectable

  const videoSelected = viewModel.videoSelected
  const photoSelected = viewModel.photoSelected
  const audioSelected = viewModel.audioSelected

  const videoSupported = viewModel.videoSupported
  const photoSupported = viewModel.photoSupported
  const audioSupported = viewModel.audioSupported

  const hostInfo = viewModel.hostInfo

  let selectablePrev:boolean|undefined = undefined
  $: if ($typeSelectable !== selectablePrev) {
    selectablePrev = typeSelectable.currentValue
    launch(async () => {
      await tick()
      dispatch('heightChanged')
    })
  }

  function toggle(type:CurrentValueStore<boolean>) {
    if(type.currentValue) {
      let c = 0
      if(videoSelected.currentValue && videoSupported.currentValue) { c++ }
      if(photoSelected.currentValue && photoSupported.currentValue) { c++ }
      if(audioSelected.currentValue && audioSupported.currentValue) { c++ }
      if(c>1) {
        type.set(false)
      }
    } else {
      type.set(true)
    }
  }

</script>

<div class="flex flex-col justify-center items-center py-2 gap-1 bg-background">
  {#if $typeSelectable}
    <ButtonGroup>
      {#if $videoSupported}
        <Button size="xs" class="h-7" checked={$videoSelected} on:click={()=>{toggle(videoSelected)}}>
          <SvgIcon name="video" class="w-4 h-4" path={ICON_VIDEO}/>
          Video
        </Button>
      {/if}
      {#if $audioSupported}
        <Button size="xs" class="h-7" checked={$audioSelected} on:click={()=>toggle(audioSelected)}>
          <SvgIcon name="audio" class="w-4 h-4" path={ICON_AUDIO}/>
          Audio
        </Button>
      {/if}
      {#if $photoSupported}
        <Button size="xs" class="h-7" checked={$photoSelected} on:click={()=>toggle(photoSelected)}>
          <SvgIcon name="photo" class="w-4 h-4" path={ICON_PHOTO}/>
          Photo
        </Button>
      {/if}
    </ButtonGroup>
  {/if}
  <Label>
    {$hostInfo?.displayName ?? "----" }
  </Label>
</div>