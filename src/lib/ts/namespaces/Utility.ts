export namespace Utility {
	export function lerp(v0: number, v1: number, t: number): number {
		return (1 - t) * v0 + t * v1;
	}

	export function countDays(date1: Date, date2: Date) {
		const differenceInMilliseconds = date2.getTime() - date1.getTime();
		const millisecondsInADay = 1000 * 60 * 60 * 24;
		const days = differenceInMilliseconds / millisecondsInADay;
		return days;
	}

	export function clamp(value: number, min: number, max: number): number {
		return value < min ? min : value > max ? max : value;
	}

	var holidays = {
		// keys are formatted as month,week,day
		'0,2,1': 'Martin Luther King, Jr. Day',
		'1,2,1': "President's Day",
		'2,1,0': 'Daylight Savings Time Begins',
		'3,3,3': 'Administrative Assistants Day',
		'4,1,0': "Mother's Day",
		'4,-1,1': 'Memorial Day',
		'5,2,0': "Father's Day",
		'6,2,0': 'Parents Day',
		'8,0,1': 'Labor Day',
		'8,1,0': 'Grandparents Day',
		'8,-1,0': 'Gold Star Mothers Day',
		'9,1,1': 'Columbus Day',
		'10,0,0': 'Daylight Savings Time Ends',
		'10,3,4': 'Thanksgiving Day'
	};

	function getHoliday(month, week, day) {
		return holidays[month + ',' + week + ',' + day];
	}

	export function isDateHoliday(date: Date) {
		return getHoliday(date.getMonth(), getWeekOfMonth(date, true), date.getDay());
	}

	function getWeekOfMonth(date: Date, exact: boolean) {
		var month = date.getMonth(),
			year = date.getFullYear(),
			firstWeekday = new Date(year, month, 1).getDay(),
			lastDateOfMonth = new Date(year, month + 1, 0).getDate(),
			offsetDate = date.getDate() + firstWeekday - 1,
			index = 1,
			weeksInMonth = index + Math.ceil((lastDateOfMonth + firstWeekday - 7) / 7),
			week = index + Math.floor(offsetDate / 7);
		if (exact || week < 2 + index) return week;
		return week === weeksInMonth ? index + 5 : week;
	}

	export function formatBytes(bytes: number, decimals: number = 2) {
		if (bytes === 0) return '0 Bytes';

		const k = 1024;
		const dm = decimals < 0 ? 0 : decimals;
		const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

		const i = Math.floor(Math.log(bytes) / Math.log(k));

		return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
	}
}
