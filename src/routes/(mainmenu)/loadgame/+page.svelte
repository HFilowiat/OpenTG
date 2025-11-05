<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/Button.svelte';
	import { language, selectedLanguage } from '$lib/ts/stores/Stores';
	import type { Save } from '$lib/ts/types/Save';
	import { saves } from '$lib/ts/stores/Stores';
	import { base } from '$app/paths';
	import backIcon from '$lib/assets/icons/icon_back.svg';
	import { get } from 'svelte/store';
	import { replaceDateObject, reviveDateObject } from '$lib/ts/helper/JsonHelper';

	let selectedSave: Save | undefined;

	export async function ExportSave(save: Save) {
		const saveWithData = await saves.toObject(save);
		const fileName = 'TechGiantsOpenSource' + '-' + crypto.randomUUID() + '-' + save.name;
		const dataStr =
			'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(saveWithData, replaceDateObject));
		const dlAnchorElem = document.createElement('a');
		dlAnchorElem.setAttribute('href', dataStr);
		dlAnchorElem.setAttribute('download', fileName + '.save.json');
		dlAnchorElem.click();
	}

	let saveRecordToLoad: Record<any, any> | undefined = undefined;

	export function ImportSave(e: any) {
		const input = <HTMLInputElement>document.createElement('input');

		input.type = 'file';
		input.accept = '.save.json';

		input.onchange = (e) => {
			const element = <HTMLInputElement>e.target;

			if (!element.files) return;

			var file = element.files[0];

			if (!file) {
				return;
			}

			var reader = new FileReader();
			reader.onload = function (e) {
				if (!e.target) return;

				const contents = e.target.result;

				if (!contents) return;

				const record = JSON.parse(contents.toString(), reviveDateObject);

				const doesThisSaveExists = get(saves).find((save) => save.id === record.save.id)
					? true
					: false;

				if (doesThisSaveExists) {
					overwriteConfirmDialog?.showModal();
					saveRecordToLoad = record;
				} else {
					saves.fromObject(record);
				}

				input.remove();
			};
			reader.readAsText(file);
		};

		input.click();
	}

	function ConfirmImportSave() {
		if (saveRecordToLoad) {
			saves.fromObject(saveRecordToLoad);
			saveRecordToLoad = undefined;
			overwriteConfirmDialog?.close();
		}
	}

	export async function DeleteSave(save: Save) {
		await saves.delete(save);
		selectedSave = undefined;
		deleteConfirmDialog?.close();
	}

	let deleteConfirmDialog: HTMLDialogElement | undefined;
	let overwriteConfirmDialog: HTMLDialogElement | undefined;

</script>

<header class="back">
	<a href="javascript:history.back()" class="back">
		<img src={backIcon} alt="" />
		<span>{$language.BACK}</span>
	</a>
	<h1>{$language.LOAD_GAME}</h1>
</header>

<main>
	<dialog bind:this={overwriteConfirmDialog}>
		<p>{$language.THIS_SAVE_ALREADY_EXISTS_DO_YOU_WANT_TO_OVERWRITE_IT}</p>

		<div style="display: flex;justify-content: space-between;gap: 1rem;">
			<Button variant="danger" on:click={() => ConfirmImportSave()}>{$language.OVERWRITE}</Button>

			<form>
				<button type="submit" autofocus formmethod="dialog" style="height: 100%;"
					>{$language.CLOSE}</button>
			</form>
		</div>
	</dialog>

	<dialog bind:this={deleteConfirmDialog}>
		<p>{$language.ARE_YOU_CERTAIN_YOU_WANT_TO_DELETE} {selectedSave?.name}</p>

		<div style="display: flex;justify-content: space-between;gap: 1rem;">
			<button
				on:click={() => {
					if (selectedSave) {
						DeleteSave(selectedSave);
					}
				}}>{$language.CONFIRM}</button>

			<form>
				<button type="submit" autofocus formmethod="dialog">{$language.CLOSE}</button>
			</form>
		</div>
	</dialog>

	<div
		style="width: 100%;display: flex;flex-direction: row;gap: 1rem;justify-content: space-between; flex-wrap: wrap;">
		<Button variant="secondary" on:click={ImportSave}>{$language.IMPORT}</Button>
		<Button
			variant="secondary"
			on:click={() => {
				if (selectedSave) ExportSave(selectedSave);
			}}
			disabled={!selectedSave}>{$language.EXPORT}</Button>

		<Button
			variant="danger"
			on:click={() => {
				if (selectedSave && deleteConfirmDialog) {
					deleteConfirmDialog.showModal();
				}
			}}
			disabled={!selectedSave}>{$language.DELETE}</Button>

		<Button
			variant="primary"
			grow
			on:click={() => {
				if (selectedSave) {
					goto(`${base}/${selectedSave.id}`);
				}
			}}
			disabled={!selectedSave || selectedSave.cash < 0}>{$language.LOAD}</Button>
	</div>

	<div style="display: flex; gap: 0.5rem; flex-direction: column; flex-grow: 1; ">
		{#each $saves as save, i}
			<button class="listcard" style="width: 100%;" on:click={() => (selectedSave = save)}>
				<div style="color: var(--primary-foreground-color)">
					{i + 1}
				</div>

				<div style="display: flex;flex-direction: column;flex: 1;">
					<div>{save.name}</div>

					<div>
						{$language.CASH}:
						<span style="font-weight: 600;"
							>{new Intl.NumberFormat($selectedLanguage, {
								style: 'currency',
								currency: 'USD'
							}).format(save.cash)}</span>
					</div>

					<small>
						{$language.LAST_SAVED}: {new Intl.DateTimeFormat($selectedLanguage, {
							year: 'numeric',
							month: 'short',
							day: 'numeric',
							hour: 'numeric',
							minute: 'numeric',
							hour12: true
						}).format(save.lastSaved)}
					</small>

					<small>
						{$language.CREATED_AT}: {new Intl.DateTimeFormat($selectedLanguage, {
							year: 'numeric',
							month: 'short',
							day: 'numeric',
							hour: 'numeric',
							minute: 'numeric',
							hour12: true
						}).format(save.created)}
					</small>

				</div>
			</button>
		{/each}
	</div>
</main>
