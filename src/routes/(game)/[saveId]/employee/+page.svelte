<script lang="ts">
	import Portrait from '$lib/components/Portrait.svelte';
	import { cash } from '$lib/ts/stores/Cash';
	import Icon from '$lib/components/Icon.svelte';
	import { language, selectedLanguage } from '$lib/ts/stores/Stores';
	import { buildings, teams } from '$lib/ts/stores/Stores';
	import { JobTitles } from '$lib/ts/enums/JobTitles';
	import Button from '$lib/components/Button.svelte';
	import { Employee } from '$lib/ts/classes/Employee';
	import type { EmployeeData } from '$lib/ts/interfaces/EmployeeData';
	import type { Team } from '$lib/ts/classes/Team';
	import backIcon from '$lib/assets/icons/icon_back.svg';
	import { getBuildingOfficeSpacePeople } from '$lib/ts/classes/Building';

	$: maxEmployeeLimit = $buildings
		.filter((b) => b.isBought || b.isLeased)
		.reduce((p, c) => (p += getBuildingOfficeSpacePeople(c)), 0);

	function hireEmployeeToTeam(team: Team, requestedJobTitle: keyof typeof JobTitles) {
		if (team.employees.length >= maxEmployeeLimit) return;

		let newEmployee: EmployeeData = Employee.create(requestedJobTitle);

		team.employees.push(newEmployee);
		teams.refresh();
	}

	function fireEmployeeFromTea(team: Team, employee: EmployeeData) {
		// filter removes the employee and returns the others
		team.employees = team.employees.filter((e) => e.fullName !== employee.fullName);
		teams.refresh();
		selectedEmployee = undefined;
	}

	$: formatter = new Intl.NumberFormat($selectedLanguage, {
		style: 'currency',
		currency: 'USD',
		notation: 'compact',
		minimumFractionDigits: 2
	});

	$: totalSalaryPerMonth =
		$teams[0]?.employees.reduce((v, e) => {
			v += e.salary;
			return v;
		}, 0) || 0;

	$: totalNumberOfEmployees = $teams.reduce((v, t) => {
		v += t.employees.length;
		return v;
	}, 0);

	$: selectedEmployee = $teams[0]?.employees[0];

	$: skillNames = <Record<any, string>>{
		Artist: $language.ART,
		AudioEngineer: $language.AUDIO_ENGINEERING,
		Designer: $language.DESIGN,
		Director: $language.DIRECTING,
		Producer: $language.PRODUCING,
		Programmer: $language.PROGRAMMING,
		Writer: $language.WRITING
	};

	$: jobNames = <Record<any, string>>{
		Artist: $language.ARTIST,
		'Audio Engineer': $language.AUDIO_ENGINEER,
		Designer: $language.DESIGNER,
		Director: $language.DIRECTOR,
		Producer: $language.PRODUCER,
		Programmer: $language.PROGRAMMER,
		Writer: $language.WRITER
	};

	$: typeofEmployeeToHire = <keyof typeof JobTitles>'Artist';
</script>

<header class="back">
	<a href="javascript:history.back()" class="back">
		<img src={backIcon} alt="" />
		<span>{$language.BACK}</span>
	</a>
</header>

<main>
	<div
		style="display: flex;gap: 2em;justify-content: center;align-content: center;flex-wrap: wrap;flex-direction: row;align-items: center;">
		<span>{$language.AVAILABLE_OFFICE_SPACE}: {totalNumberOfEmployees} / {maxEmployeeLimit}</span>
		<span>{$language.TOTAL_SALARY_PER_MONTH}: {formatter.format(totalSalaryPerMonth)}</span>

		{#if totalSalaryPerMonth > $cash}
			<div style="display: flex; gap: 1rem; align-items:center">
				<span style="color: #FFAB25"><Icon src={import('$assets/icons/icon_warning.svg?raw')} /></span>
				<span>{$language.SALARY_EXPENSES_ARE_HIGH}</span>
			</div>
		{/if}
	</div>

	{#each $teams as team}
		<div style="gap: 2em; display: flex; flex-direction: column; align-items: flex-start;">

			{#if team.name.length === 0}
				<div style="display: flex; gap: 1rem; align-items:center">
					<span style="color: #FFAB25"><Icon src={import('$assets/icons/icon_warning.svg?raw')} /></span>
					<span>{$language.PLEASE_ENTER_A_TEAM_NAME}</span>
				</div>
			{/if}

			<div style="display: flex; gap: 0.5em; flex-direction: row; width: 100%; flex-wrap: wrap; ">
				<input style="flex: 1; " type="text" bind:value={team.name} placeholder="Team Name" />

				<div>
					<div style="display: flex; flex-direction:row; gap: 0.5em">
						<select bind:value={typeofEmployeeToHire}>
							{#each Object.entries(JobTitles) as [key, job]}
								<option value={key}>{jobNames[job]}</option>
							{/each}
						</select>

						<Button
							on:click={() => hireEmployeeToTeam(team, typeofEmployeeToHire)}
							disabled={team.employees.length >= maxEmployeeLimit}>{$language.HIRE_EMPLOYEE}</Button>
					</div>
				</div>
			</div>

			<div style="display: flex; gap: 0.5em; flex-direction: column;">
				<span class="label">{$language.TEAM_SKILLS}</span>

				<div style="display: flex; flex-direction:row; gap: 0.5em; flex-wrap: wrap;">
					{#each Object.entries(team.employees.reduce((v, emp) => {
							emp.experiance.forEach((exp) => {
								v[exp.jobTitle] ??= 0;
								v[exp.jobTitle] += exp.xp;
							});
							return v;
						}, {})) as [key, xp]}
						<span
							style="background: var(--button-color-background-hover); border-radius: 3px;display: flex; font-size:small">
							<span style="padding: 0.3em;">{skillNames[key]}</span>
							<span
								style="border-radius: 3px; background: var(--border-color-default);padding: 0.3em;min-width: 3ch;text-align: center;"
								>{xp}</span>
						</span>

					{/each}
				</div>
			</div>

			<div style="display: flex;gap: 1em;width: 100%;">
				<div
					style="width: 100%;display: flex;gap: 0.25em;flex-flow: column;justify-content: flex-start;max-width: 400px;">
					{#each team.employees as employee}
						<button
							on:click={() => (selectedEmployee = employee)}
							style="padding: 0.2em 1em 0.2em 0.2em;display: flex;flex-flow: wrap;gap: 1rem;align-items: flex-start;place-content: center flex-start;">
							<div
								style="max-width: 40px;height: 40px;border-radius: 5px;overflow: hidden; padding:0.2em; border-radius: 15px">
								{#if employee.portrait !== null}
									<Portrait portraitValues={employee.portrait} />
								{/if}
							</div>

							<div style="display: flex; flex-direction: column; gap: 0.1em; align-items:flex-start">
								<div>{employee.fullName}</div>
								<div style="font-size: smaller;">
									{JobTitles[employee.jobTitle]}
									{#if employee.isPlayer}
										{', '} {$language.FOUNDER}
									{/if}
								</div>
							</div>
						</button>
					{/each}
				</div>

				{#if selectedEmployee}
					<div style="display: flex;flex-direction: column;width: 100%;gap: 0.6em;">
						<div style="display: flex; gap: 0.5em">
							<div style="max-width: 60px;height: 60px;border-radius: 5px;overflow: hidden;">
								{#if selectedEmployee.portrait !== null}
									<Portrait portraitValues={selectedEmployee.portrait} />
								{/if}
							</div>
							<div>
								<div style="font-size: 1.2em;">{selectedEmployee.fullName}</div>
								<div>
									{JobTitles[selectedEmployee.jobTitle]}
									{#if selectedEmployee.isPlayer}
										{', '} {$language.FOUNDER}
									{/if}
								</div>
							</div>
							<div>
								{#if !selectedEmployee.isPlayer}
									<Button
										variant="danger"
										on:click={() => {
											fireEmployeeFromTea(team, selectedEmployee);
										}}
										disabled={false}>{$language.FIRE}</Button>
								{/if}
							</div>
						</div>

						{#if !selectedEmployee.isPlayer}
							<span>Salary: {formatter.format(selectedEmployee.salary)}</span>
						{/if}

					
						{#if selectedEmployee.isPlayer}
							<span class="label">{$language.JOB_TITLE}</span>

							<div style="display: flex; gap:0.3em; flex-direction: row; flex-wrap: wrap;">
								<select bind:value={selectedEmployee.jobTitle}>
									{#each selectedEmployee.experiance.map((x) => x.jobTitle) as jobtitle}
										<option value={jobtitle}>{jobNames[JobTitles[jobtitle]]}</option>
									{/each}
								</select>
							</div>
						{/if}

						<span class="label">{$language.CHARACTER_EFFECTS}</span>

						<div style="display: flex; gap:0.3em; flex-direction: row; flex-wrap: wrap;">
							<span
								style="background: var(--button-color-background-hover); border-radius: 3px;display: flex; font-size:small">
								<span style="padding: 0.3em;">{'Productivity'}</span>
								<span
									style="border-radius: 3px;background: var(--border-color-default); padding: 0.3em;min-width: 3ch;text-align: center;">
									{selectedEmployee.effects.productivity}
									{#if selectedEmployee.effects.extraProductivity !== 0}
										+ {selectedEmployee.effects.extraProductivity}
										<span
											title="{selectedEmployee.effects.extraProductivity.toFixed(
												8
											)} This character is well informed, Well informed is a temporary trait that can be acquired by reading latest magazines and news"
											>+ {selectedEmployee.effects.extraProductivity.toFixed(2)}</span>
									{/if}
								</span>
							</span>
						</div>

						<span class="label">{$language.SKILLS}</span>

						<div style="display: flex; gap:0.3em; flex-direction: row; flex-wrap: wrap;">
							{#each selectedEmployee.experiance as { jobTitle, xp }}
								<span
									style="background: var(--button-color-background-hover); border-radius: 3px;display: flex; font-size:small">
									<span style="padding: 0.3em;">{skillNames[jobTitle]}</span>
									<span
										style="border-radius: 3px; background: var(--border-color-default);padding: 0.3em;min-width: 3ch;text-align: center;"
										>{xp}</span>
								</span>

							{/each}
						</div>
					</div>
				{/if}
			</div>
		</div>
	{/each}
</main>

<style>
</style>
