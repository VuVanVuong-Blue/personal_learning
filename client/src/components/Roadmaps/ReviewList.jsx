import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';
import { toast } from 'sonner';
import { Star, Flag, MessageCircle, Send, AlertTriangle } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
dayjs.extend(relativeTime);
dayjs.locale('vi');

const ReviewList = ({ roadmapId, isAuthor, roadmapTitle }) => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    // Review Form State
    const [hasReviewed, setHasReviewed] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Reply State
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');

    // Clone Check State
    const [hasCloned, setHasCloned] = useState(false);

    useEffect(() => {
        fetchReviews();
        if (!isAuthor && user) {
            checkCloneStatus();
        }
    }, [roadmapId, isAuthor, user]);

    const checkCloneStatus = async () => {
        try {
            const res = await axiosClient.get(`/roadmaps/${roadmapId}/check-clone`);
            setHasCloned(res.data.hasCloned);
        } catch (error) {
            console.error("Lỗi khi kiểm tra clone status", error);
        }
    };

    const fetchReviews = async () => {
        try {
            const res = await axiosClient.get(`/roadmaps/${roadmapId}/reviews`);
            setReviews(res.data);
            // Check if current user already reviewed
            const userReview = res.data.find(r => r.user?._id === user?._id);
            if (userReview) setHasReviewed(true);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (rating < 1) return toast.error("Vui lòng chọn số sao đánh giá");

        setSubmitting(true);
        try {
            const res = await axiosClient.post(`/roadmaps/${roadmapId}/reviews`, {
                rating,
                comment
            });
            setReviews([res.data, ...reviews]);
            setHasReviewed(true);
            toast.success("Cảm ơn bạn đã đánh giá!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi khi gửi đánh giá");
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmitReply = async (reviewId) => {
        if (!replyText.trim()) return;
        try {
            const res = await axiosClient.post(`/roadmaps/${roadmapId}/reviews/${reviewId}/reply`, {
                text: replyText
            });
            // Update reviews list
            setReviews(reviews.map(r => r._id === reviewId ? res.data : r));
            setReplyingTo(null);
            setReplyText('');
            toast.success("Đã phản hồi đánh giá");
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi khi phản hồi");
        }
    };

    const handleReport = async (reviewId) => {
        const reason = prompt("Lý do báo cáo vi phạm (Spam/Quảng cáo, Ngôn từ thù ghét, Khác...):");
        if (!reason) return;

        try {
            await axiosClient.post('/reports', {
                targetType: 'Review',
                targetId: reviewId,
                reason: ['Spam/Quảng cáo', 'Ngôn từ thù ghét', 'Nội dung phản cảm', 'Chất lượng kém', 'Khác'].includes(reason) ? reason : 'Khác',
                description: reason
            });
            toast.success("Đã gửi báo cáo đến Admin. Cảm ơn bạn!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi khi báo cáo");
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                Đánh giá Cộng đồng ({reviews.length})
            </h3>

            {/* Review Form - Only if user hasn't reviewed AND is not the author */}
            {!isAuthor && !hasReviewed && (
                <div className="mb-8 p-5 bg-gray-50 rounded-xl border border-gray-100">
                    <h4 className="font-semibold text-gray-800 mb-3">Bạn đánh giá lộ trình này thế nào?</h4>
                    {hasCloned ? (
                        <form onSubmit={handleSubmitReview}>
                            <div className="flex gap-1 mb-4">
                                {[1, 2, 3, 4, 5].map(num => (
                                    <button
                                        key={num}
                                        type="button"
                                        onMouseEnter={() => setHoverRating(num)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => setRating(num)}
                                        className="p-1 focus:outline-none transition-transform hover:scale-110"
                                    >
                                        <Star className={`w-8 h-8 ${num <= (hoverRating || rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                                    </button>
                                ))}
                            </div>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Chia sẻ cảm nhận của bạn về lộ trình này (Tùy chọn)..."
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none resize-none"
                                rows="3"
                            ></textarea>
                            <div className="flex justify-end mt-3">
                                <button
                                    type="submit"
                                    disabled={submitting || rating === 0}
                                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Gửi Đánh Giá
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="text-center py-6 bg-white rounded-xl border border-indigo-100 border-dashed">
                            <AlertTriangle className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                            <p className="text-gray-600 font-medium">Bạn cần lưu lộ trình này về không gian cá nhân (Clone) mới có thể gửi Đánh giá.</p>
                            <p className="text-sm text-gray-500 mt-1">Điều này giúp đảm bảo các đánh giá đều đến từ những người thực sự quan tâm đến lộ trình.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Reviews List */}
            {loading ? (
                <div className="text-center py-8 text-gray-500">Đang tải đánh giá...</div>
            ) : reviews.length === 0 ? (
                <div className="text-center justify-center flex flex-col items-center py-10 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                    <MessageCircle className="w-12 h-12 text-gray-300 mb-3" />
                    <p className="text-gray-500">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {reviews.map(review => (
                        <div key={review._id} className="relative group">
                            <div className="flex gap-4 p-5 bg-gray-50/50 rounded-xl border border-gray-100 transition-colors hover:bg-gray-50">
                                {/* Avatar */}
                                <img
                                    src={review.user?.avatar || `https://ui-avatars.com/api/?name=${review.user?.username}`}
                                    alt="avatar"
                                    className="w-10 h-10 rounded-full shrink-0"
                                />

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <div>
                                            <h5 className="font-semibold text-gray-900 border-b-2 border-transparent hover:border-indigo-600 cursor-pointer inline-block transition-colors">{review.user?.username}</h5>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <div className="flex">
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <Star key={star} className={`w-3.5 h-3.5 ${star <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                                                    ))}
                                                </div>
                                                <span className="text-xs text-gray-400">• {dayjs(review.createdAt).fromNow()}</span>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {isAuthor && !review.reply && (
                                                <button onClick={() => setReplyingTo(review._id)} className="p-1.5 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 rounded transition-colors" title="Trả lời">
                                                    <MessageCircle className="w-4 h-4" />
                                                </button>
                                            )}
                                            {review.user?._id !== user?._id && (
                                                <button onClick={() => handleReport(review._id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors" title="Báo cáo vi phạm">
                                                    <Flag className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {review.comment && (
                                        <p className="text-gray-700 text-sm mt-3 whitespace-pre-line">{review.comment}</p>
                                    )}

                                    {/* Author Reply Section */}
                                    {review.reply?.text && (
                                        <div className="mt-4 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 
 relative">
                                            <div className="absolute -top-2 left-6 w-4 h-4 bg-indigo-50/50 border-t border-l border-indigo-100 transform rotate-45"></div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded">Tác giả phản hồi</div>
                                                <span className="text-xs text-gray-400">{dayjs(review.reply.createdAt).fromNow()}</span>
                                            </div>
                                            <p className="text-gray-700 text-sm whitespace-pre-line">{review.reply.text}</p>
                                        </div>
                                    )}

                                    {/* Reply Input Form (For Author) */}
                                    {isAuthor && replyingTo === review._id && (
                                        <div className="mt-4 flex gap-2 animate-in slide-in-from-top-2">
                                            <input
                                                type="text"
                                                autoFocus
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                placeholder="Viết phản hồi của bạn..."
                                                className="flex-1 px-4 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                                            />
                                            <button onClick={() => handleSubmitReply(review._id)} className="px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-1.5 text-sm font-medium">
                                                <Send className="w-4 h-4" /> Gửi
                                            </button>
                                            <button onClick={() => { setReplyingTo(null); setReplyText(''); }} className="px-3 text-gray-500 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">
                                                Hủy
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReviewList;
