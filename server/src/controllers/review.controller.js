import Review from '../models/Review.js';
import Roadmap from '../models/Roadmap.js';

// Basic Vietnamese profanity filter
const badWordsFilters = ['đụ', 'đĩ', 'lồn', 'cặc', 'ngu', 'chó đẻ', 'mẹ mày', 'thằng chó', 'đù', 'vcl', 'đcm', 'đm'];

const containsBadWord = (text) => {
    if (!text) return false;
    const lowerText = text.toLowerCase();
    return badWordsFilters.some(word => lowerText.includes(word));
};

export const createReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const roadmapId = req.params.roadmapId;
        const userId = req.user.id;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Số sao đánh giá phải từ 1 đến 5' });
        }

        if (containsBadWord(comment)) {
            return res.status(400).json({ message: 'Bình luận chứa từ ngữ không phù hợp. Vui lòng sửa lại.' });
        }

        const existingReview = await Review.findOne({ roadmap: roadmapId, user: userId });
        if (existingReview) {
            return res.status(400).json({ message: 'Bạn đã đánh giá lộ trình này rồi' });
        }

        const review = new Review({
            roadmap: roadmapId,
            user: userId,
            rating,
            comment
        });
        await review.save();

        // Update Roadmap Stats
        const reviews = await Review.find({ roadmap: roadmapId });
        const totalReviews = reviews.length;
        const sumRating = reviews.reduce((acc, curr) => acc + curr.rating, 0);
        const averageRating = (sumRating / totalReviews).toFixed(1);

        await Roadmap.findByIdAndUpdate(roadmapId, {
            averageRating: Number(averageRating),
            totalReviews
        });

        await review.populate('user', 'username avatar');
        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getRoadmapReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ roadmap: req.params.roadmapId })
            .populate('user', 'username avatar')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const replyToReview = async (req, res) => {
    try {
        const { text } = req.body;
        const reviewId = req.params.reviewId;

        if (containsBadWord(text)) {
            return res.status(400).json({ message: 'Phản hồi chứa từ ngữ không phù hợp.' });
        }

        const review = await Review.findById(reviewId).populate('roadmap');
        if (!review) return res.status(404).json({ message: 'Không tìm thấy đánh giá' });

        // Check if user is the author of the roadmap
        if (review.roadmap.author.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Chỉ tác giả lộ trình mới có quyền trả lời' });
        }

        review.reply = {
            text,
            createdAt: new Date()
        };

        await review.save();
        res.json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
