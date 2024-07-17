import type { AuthPermission, AuthResource } from 'ccat-api'
import type { JwtPayload } from 'jwt-decode'
import { useJwt } from '@vueuse/integrations/useJwt'
import { useCookies } from '@vueuse/integrations/useCookies'
import LogService from '@services/LogService'


interface Filter {
	[k: string]: {
		values: string[]
		current: string
	}
}

type AuthToken = JwtPayload & {
	username: string
	permissions: Record<AuthResource, AuthPermission[]>
}

/**
 * App wide store, containing info used in multiple views and components
 */
export const useMainStore = defineStore('main', () => {

	/**
	 * Extract cookie from headers and JWT payload from it
	 */
	const cookies = useCookies(['ccat_user_token'], { doNotParse: true, autoUpdateDependencies: true })
	const cookie = computed(() => cookies.get<string | undefined>('ccat_user_token'))
	const jwtPayload = computed(() => {
		if (!cookie.value) return null
		const { payload } = useJwt<AuthToken>(cookie.value)
		return payload.value
	})
	
	/**
	 * Dark theme
	 */
	const isDark = useDark({
		storageKey: 'currentTheme',
		selector: 'html',
		disableTransition: false,
		attribute: 'data-theme',
		valueDark: 'dark',
		valueLight: 'light',
	})
	const toggleDark = useToggle(isDark)

	/**
	 * plugins filters
	 */
	const pluginsFilters = useLocalStorage<Filter>('pluginsFilters', {
		presence: {
			current: 'both',
			values: ['both', 'installed', 'registry'],
		},
		visibility: {
			current: 'both',
			values: ['both', 'enabled', 'disabled'],
		},
	})

	return {
		isDark,
		pluginsFilters,
		toggleDark,
		cookie,
		jwtPayload
	}
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useMainStore, import.meta.hot))
}
