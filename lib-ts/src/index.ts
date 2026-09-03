import { PrismaClient, type Prisma } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function upsertJobPosting(data: {
	jobId: string;
	title: string;
	company: string;
	location?: string;
	url: string;
	description?: string;
	relevanceScore?: number;
	atsKeywordMatch?: number;
	postedDate?: Date;
	status?: string;
}) {
	const { jobId, title, company, location, url, description, relevanceScore, atsKeywordMatch, postedDate, status } = data;
	const values: Prisma.JobPostingCreateInput = {
		jobId,
		title,
		company,
		url,
		...(location !== undefined ? { location } : {}),
		...(description !== undefined ? { description } : {}),
		...(relevanceScore !== undefined ? { relevanceScore } : {}),
		...(atsKeywordMatch !== undefined ? { atsKeywordMatch } : {}),
		...(postedDate !== undefined ? { postedDate } : {}),
		...(status !== undefined ? { status } : {}),
	};

	return prisma.jobPosting.upsert({
		where: { jobId },
		create: values,
		update: values,
	});
}

export function listJobPostings(status?: string) {
	return prisma.jobPosting.findMany({
		where: status ? { status } : undefined,
		orderBy: [{ relevanceScore: 'desc' }, { createdAt: 'desc' }],
	});
}

export async function saveTailoredResume(data: {
	userId: string;
	jobId: string;
	filePath?: string;
	summary?: string;
	atsScore?: number;
	matchedKeywords?: string[];
}) {
	const { userId, jobId, filePath, summary, atsScore, matchedKeywords } = data;
	const values: Prisma.TailoredResumeCreateInput = {
		user: { connect: { id: userId } },
		job: { connect: { jobId } },
		...(filePath !== undefined ? { filePath } : {}),
		...(summary !== undefined ? { summary } : {}),
		...(atsScore !== undefined ? { atsScore } : {}),
		...(matchedKeywords !== undefined ? { matchedKeywords } : {}),
	};

	return prisma.tailoredResume.upsert({
		where: { userId_jobId: { userId, jobId } },
		create: values,
		update: values,
	});
}

export * from '@prisma/client';
