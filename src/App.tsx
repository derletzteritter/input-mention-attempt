import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import './App.css';
import { editableInputTypes } from "@testing-library/user-event/dist/utils";
import shadows from "@mui/material/styles/shadows";

interface User {
	id: number;
	name: string;
	avatar: string;
}

function App() {
	const [tweet, setTweet] = useState<string>('');
	const [users, setUsers] = useState<User[]>([])
	const [mentionedUsers, setMentionedUsers] = useState<string[]>([]);
	const [suggestions, setSuggestions] = useState<User[]>([]);
	const [showMentions, setShowMentions] = useState<boolean>(false);
	
	const [lastHtml, setLastHtml] = useState(null);
	
	const [inputSelection, setInputSelection] = useState({ start: 0, end: 0 });
	
	const inputRef = useRef<any>(null);
	const text = useRef<any>(null);
	
	const escapeRegex = (str: string) => str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
	
	const makeTriggerRegex = () => {
		const trigger = escapeRegex('@');
		
		return new RegExp(`(?:^|\\s)(${trigger}([^\\s${trigger}]*))$`)
	}
	
	useEffect(() => {
		const getUsers = async () => {
			const resp = await fetch('https://reqres.in/api/users', {
				method: 'GET'
			});
			const response = await resp.json();
			
			const formattedResponse = response.data.map((res: any) => {
				const user = {
					id: res.id,
					name: `${res.first_name}${res.last_name}`,
					avatar: res.avatar
				};
				
				return user;
			})
			
			console.log(formattedResponse)
			setUsers(formattedResponse);
		}
		
		getUsers();
	}, [])
	
	const handleInputChange = (e: any) => {
		text.current = e.target.value;
		
		const value = normalizeHtml(text.current)
		
		let matches: User[] = [];
		
		if (value.length > 0) {
			const regex = makeTriggerRegex();
			const match = value.match(regex)
			if (match) {
				console.log('is match', match)
				const newValue = match[1].replace('@', '').trim();
				
				matches = users.filter((user) => {
					const regExp = new RegExp(`${newValue}`, 'gi');
					return user.name.match(regExp);
				})
				
				if (matches) {
					setSuggestions(matches);
				}
				
				if (suggestions) {
					setShowMentions(true)
				}
			} else {
				setShowMentions(false)
			}
		}
	}
	
	const onSuggestionSelect = (value: string) => {
		inputRef.current.focus();
		
		inputRef.current.innerHTML += `<strong style="background: cornflowerblue">${value}</strong>`;
		
		setMentionedUsers((curVal) => [...curVal, value])
		setShowMentions(false);
		
		replaceCaret(inputRef.current)
	}
	
	const emitChange = (originalEvent: React.SyntheticEvent<any>) => {
		const el = inputRef.current;
		
		const html = el.innerHTML;
		if (html !== lastHtml) {
			const evt = Object.assign({}, originalEvent, {
				target: {
					value: html
				}
			})
			
			handleInputChange(evt);
		}
		
		setLastHtml(html);
	}
	
	
	function replaceCaret(el: HTMLElement) {
		// Place the caret at the end of the element
		const target = document.createTextNode('');
		el.appendChild(target);
		// do not move caret if element was not focused
		const isTargetFocused = document.activeElement === el;
		if (target !== null && target.nodeValue !== null && isTargetFocused) {
			var sel = window.getSelection();
			if (sel !== null) {
				var range = document.createRange();
				range.setStart(target, target.nodeValue.length);
				range.collapse(true);
				sel.removeAllRanges();
				sel.addRange(range);
			}
			if (el instanceof HTMLElement) el.focus();
		}
	}
	
	function normalizeHtml(str: string): string {
		return str && str.replace(/&nbsp;|\u202F|\u00A0/g, ' ');
	}
	
	useEffect(() => {
		replaceCaret(inputRef.current);
	}, [text.current])
	
	return (
		<div className="App">
			<header className="App-header">
				<div className="container">
					<div className="tweet-input" dangerouslySetInnerHTML={{ __html: text.current }} contentEditable={true} ref={inputRef} onInput={emitChange} />
					<div className="suggestion-container">
						{text.current && suggestions && showMentions && suggestions.map((suggestion, i) => (
							<div className="suggestion-item" onClick={() => onSuggestionSelect(suggestion.name)}>
								<img src={suggestion.avatar}/>
								<p>{suggestion.name}</p>
							</div>
						))}
					</div>
				</div>
			</header>
		</div>
	);
}

export default App;