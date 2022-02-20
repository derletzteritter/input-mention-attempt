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
	
	const [inputSelection, setInputSelection] = useState({ start: 0, end: 0 });
	
	const inputRef = useRef<HTMLTextAreaElement>(null);
	
	const escapeRegex = (str: string) => str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
	
	const makeTriggerRegex = () => {
		const trigger = escapeRegex('@');
		
		return new RegExp(`(?:^|\\s)(${trigger}([^\\s${trigger}]*))$`)
	}
	
	const regExp = new RegExp('@', 'ig');
	
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
		const value = e.target.value;
		console.log('very val', value)
		
		let matches: User[] = [];
		
		if (value.length > 0) {
			const regex = makeTriggerRegex();
			const match = value.match(regex)
			if (match) {
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
		
		setTweet(value);
	}
	
	const onSuggestionSelect = (value: string) => {
		inputRef.current.focus();
		setTweet((curVal) => curVal + value.trim());
		
		setMentionedUsers((curVal) => [...curVal, value])
		setShowMentions(false);
		
	}
	
	const handleSendTweet = () => {
		console.log('stored users', mentionedUsers)
	}
	
	return (
		<div className="App">
			<header className="App-header">
				<div className="container">
					<ContentEditable ref={inputRef} onChange={handleInputChange} html={tweet}/>
					<div className="suggestion-container">
						{tweet && suggestions && showMentions && suggestions.map((suggestion, i) => (
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

const ContentEditable = ({ html, onChange, children }: any) => {
	let lastHtml = html;
	
	const contentRef = useRef<HTMLDivElement>(null);
	
	const emitChange = (originalEvent: React.SyntheticEvent<any>) => {
		const el = contentRef.current;
		
		const elHtml = el.innerHTML;
		if (onChange && html !== lastHtml) {
			console.log(elHtml)
			
			const evt = Object.assign({}, originalEvent, {
				target: {
					value: elHtml
				}
			})
			
			onChange(evt);
		}
		
		lastHtml = elHtml
	}
	
	return (
		<div onInput={emitChange} ref={contentRef} contentEditable={true}>
			{children}
		</div>
	)
}

export default App;
