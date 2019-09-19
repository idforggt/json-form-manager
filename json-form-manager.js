const isIdx = target => Number.isInteger(Number(target));

const getValue = element => {
	const value = element.value;
	switch ((element.getAttribute('type') || '').toLowerCase()) {
		case 'number':
			const number = Number(value);
			if (isNaN(number)) {
				throw new TypeError(`Invalid number. value=${value}`);
			}
			return number;
		case 'checkbox':
		case 'radio':
			if (value) {
				return element.checked ? value : '';
			} else {
				return element.checked;
			}
	}
	return value;
};

const serialize = form => {
	if (!form instanceof HTMLFormElement) {
		throw new TypeError('Invalid parameter. form is not HTMLFormElement');
	}

	let root = {};

	for (var elIdx = 0; elIdx < form.elements.length; elIdx++) {
		const element = form.elements.item(elIdx);

		// const tagName = element.tagName;
		const key = element.getAttribute('name');
		if (!key || (element.getAttribute('type') === 'radio' && !element.checked)) {
			continue;
		}

		if (/^[^\[\]]+(\[[^\[\]]+\])*$/.test(key) === false) {
			throw new TypeError(`Invalid json key. name="${key}"`);
		}

		const nestedKeys = key.match(/([^\[\]]+)/g);

		let parent = root;
		for (var keyIdx = 0; keyIdx < nestedKeys.length; keyIdx++) {
			const currentKey = nestedKeys[keyIdx];
			const nextKey = nestedKeys[keyIdx + 1];

			const isParentArray = Array.isArray(parent);
			const isCurrentKeyIdx = isIdx(currentKey);
			if ((isParentArray && !isCurrentKeyIdx) || (!isParentArray && isCurrentKeyIdx)) {
				throw new TypeError(`Parent is ${isParentArray ? 'Array' : 'Object'}, but key is ${isCurrentKeyIdx ? 'index' : 'not index'}. - key=${key}`);
			}

			if (!nextKey) {
				// case : leaf node - assign value
				if (parent[currentKey] !== undefined) {
					throw new Error(`Duplicated key(=${key}).`);
				}
				parent[currentKey] = getValue(element);
			} else if (!parent[currentKey]) {
				parent[currentKey] = isIdx(nextKey) ? [] : {};
			}
			parent = parent[currentKey];
		}
	}
	return root;
};

export { serialize };
