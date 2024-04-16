<script lang="ts">
  import { invoke } from "@tauri-apps/api/tauri"
  import { createBooProtocol } from "./BooProtocol";

  let name = "";
  let greetMsg = ""

  async function greet(){
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    // greetMsg = await invoke("greet", { name })
    // let response = await fetch("http://localhost:3500/capability")
    const bp = createBooProtocol(async ()=>{
      return "a"
    })

    await bp.setup({host: "localhost", port: 6001})
    const list = await bp.list({type: "mp4"})

    // let body = await response.body?.getReader().read()
    if(list!=null) {
      // greetMsg = new TextDecoder().decode(body.value)
      greetMsg = list.list[0]!!.name + " " + list.list[0]!!.size + " " + list.list.length
    } else {
      greetMsg = "No response from server"
    }
  }
</script>

<div>
  <form class="row" on:submit|preventDefault={greet}>
    <input id="greet-input" placeholder="Enter a name..." bind:value={name} />
    <button type="submit">Greet</button>
  </form>
  <p>{greetMsg}</p>
</div>