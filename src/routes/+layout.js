export const load = async ({ data, depends }) => {
	depends('convex:auth');
	return data;
};
