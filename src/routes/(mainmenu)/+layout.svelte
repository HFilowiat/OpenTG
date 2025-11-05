<script lang="ts">
	import { AudioMixer } from '$lib/ts/namespaces/AudioMixer';
	AudioMixer.playTrack(AudioMixer.filenames[0]);
</script>

<slot></slot>
